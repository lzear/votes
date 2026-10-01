import { type QE } from '../../classes/round-ballot-method'
import {
  RoundBallotMethodTb,
  tb,
  type TbEntry,
} from '../../classes/round-ballot-method-tb'
import { type ScoreObject } from '../../types'
import { FirstPastThePost } from '../first-past-the-post'

/**
 * Each round:
 * 1. Rank remaining candidates by FPTP (first-choice votes).
 * 2. Take the bottom-2 candidates from that ranking, or all of those tied
 *    with them.
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
  protected builtInTieBreakers(): TbEntry<C>[] {
    return [tb(FirstPastThePost)]
  }

  protected round(candidates: C[]): QE<C> {
    const fptp = new FirstPastThePost({
      ballots: this.ballotsFor(candidates),
      candidates,
    })
    const ranked = fptp.deTie()
    const scores: ScoreObject<C> = fptp.scores()

    const last = ranked.at(-1) ?? []

    // Complete tie — no meaningful bottom-2 distinction; everyone ties
    if (last.length === candidates.length)
      return { qualified: [], eliminated: candidates, scores }

    // The bottom two, or everyone tied with them: picking two of a tie by list
    // order would make the result depend on the order candidates are given in.
    const pending =
      last.length >= 2 ? last : [...last, ...(ranked.at(-2) ?? [])]

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
      ...(tieBreakSteps.length > 0 && { tieBreakSteps }),
    }
  }
}
