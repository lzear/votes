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
      // FPTP is always injected first: it IS the head-to-head runoff mechanism
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

    // bottom candidate, plus second-to-last if bottom is unambiguous
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
