import { type QE } from '../../classes/round-ballot-method'
import {
  RoundBallotMethodTb,
  tb,
  type TbEntry,
} from '../../classes/round-ballot-method-tb'
import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots } from '../../utils'
import { FirstPastThePost } from '../first-past-the-post'

/**
 * Each round:
 * 1. Rank remaining candidates by FPTP (first-choice votes).
 * 2. Take the bottom-2 candidates from that ranking.
 * 3. Eliminate whichever of the two loses a head-to-head FPTP matchup.
 *
 * The head-to-head step in (3) is implemented by prepending
 * `tb(FirstPastThePost)` to the tieBreakers array — so it will always appear
 * as the first entry in `tieBreakSteps`. Any additional `tieBreakers` you
 * supply are applied after FPTP if the head-to-head itself ends in a tie.
 *
 * #### Electowiki: [Bottom-Two-Runoff IRV](https://electowiki.org/wiki/Bottom-Two-Runoff_IRV)
 */
export class BottomTwoRunoff<C extends string> extends RoundBallotMethodTb<C> {
  constructor(input: {
    ballots: Ballot<C>[]
    candidates: C[]
    tieBreakers?: TbEntry<C>[]
  }) {
    super({
      ...input,
      tieBreakers: [tb(FirstPastThePost), ...(input.tieBreakers ?? [])],
    })
  }

  protected round(candidates: C[]): QE<C> {
    const fptp = new FirstPastThePost({
      ballots: normalizeBallots(this.ballots, candidates),
      candidates,
    })
    const ranked = fptp.deTie()
    const scores: ScoreObject<C> = fptp.scores()

    const last = ranked.at(-1) ?? []

    // Complete tie — no meaningful bottom-2 distinction; everyone ties
    if (last.length === candidates.length)
      return { qualified: [], eliminated: candidates, scores }

    // Build the bottom-2 pair. When more than 2 candidates share the last tier
    // (all unresolvable by FPTP even on the restricted subset), the first 2 by
    // array order are used — this is an edge case with no canonical resolution.
    const secondLast = ranked.at(-2) ?? []
    const pending: C[] =
      last.length >= 2
        ? last.slice(0, 2)
        : [...last, ...secondLast.slice(0, 2 - last.length)]

    const pendingSet = new Set(pending)
    const mainQualified = candidates.filter((c) => !pendingSet.has(c))
    const {
      qualified: q2,
      eliminated,
      tieBreakSteps,
    } = this.resolvePending(pending)
    return {
      qualified: [...mainQualified, ...q2],
      eliminated,
      scores,
      ...(tieBreakSteps.length > 0 ? { tieBreakSteps } : {}),
    }
  }
}
