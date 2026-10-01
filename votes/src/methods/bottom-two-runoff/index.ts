import { type QE } from '../../classes/round-ballot-method'
import {
  RoundBallotMethodTb,
  type TiebreakerEntry,
} from '../../classes/round-ballot-method-tb'
import { scoresToRanking } from '../../utils'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

/**
 * Each round:
 * 1. Rank remaining candidates by FPTP (first-choice votes).
 * 2. Take the bottom-2 candidates from that ranking, or all of those tied
 *    with them.
 * 3. Eliminate whichever of the two loses a head-to-head FPTP matchup.
 *
 * The head-to-head step in (3) is a built-in `FirstPastThePost` tiebreaker,
 * so it always appears as the first entry in `tieBreakSteps`. Any
 * `tieBreakers` you supply apply after it if the head-to-head ends in a tie.
 *
 * #### Electowiki: [Bottom-Two-Runoff IRV](https://electowiki.org/wiki/Bottom-Two-Runoff_IRV)
 */
export class BottomTwoRunoff<C extends string> extends RoundBallotMethodTb<C> {
  protected builtInTieBreakers(): TiebreakerEntry<C>[] {
    // First choices on the ballots as they are: a FirstPastThePost would
    // re-normalize them every round.
    const fn = (tied: C[]) => {
      const scores = firstChoices(this.ballots, tied)
      return { ranking: scoresToRanking(scores), scores }
    }
    return [{ name: 'FirstPastThePost', fn }]
  }

  protected round(candidates: C[]): QE<C> {
    const scores = firstChoices(this.ballots, candidates)
    // Ties split by first choices among the tied.
    const ranked = scoresToRanking(scores).flatMap((tier) =>
      tier.length <= 1
        ? [tier]
        : scoresToRanking(firstChoices(this.ballots, tier)),
    )

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
