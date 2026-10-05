import { type Step } from '../../classes/round-ballot-method'
import { RoundBallotMethodTb } from '../../classes/round-ballot-method-tb'
import { type Tiebreaker } from '../../classes/tiebreaker'
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
 * so it always appears as the first entry in `tieBreakSteps`. In an
 * `Election`, the methods after it apply only if the head-to-head ends in a
 * tie.
 *
 * #### Electowiki: [Bottom-Two-Runoff IRV](https://electowiki.org/wiki/Bottom-Two-Runoff_IRV)
 */
export class BottomTwoRunoff<C extends string> extends RoundBallotMethodTb<C> {
  // The bottom two of `race` on first choices, or everyone tied with them:
  // picking two of a tie by list order would make the result depend on the
  // order candidates are given in. Ties split by first choices among the tied.
  private bottomTwo(race: C[]): C[] {
    const ranked = scoresToRanking(firstChoices(this.ballots, race)).flatMap(
      (tier) =>
        tier.length <= 1
          ? [tier]
          : scoresToRanking(firstChoices(this.ballots, tier)),
    )
    const last = ranked.at(-1) ?? []
    return last.length >= 2 ? last : [...last, ...(ranked.at(-2) ?? [])]
  }

  protected override builtInTieBreakers(): Tiebreaker<C>[] {
    // First choices on the ballots as they are: a FirstPastThePost would
    // re-normalize them every round.
    const run = (tied: C[]) => {
      const scores = firstChoices(this.ballots, tied)
      return { ranking: scoresToRanking(scores), scores }
    }
    return [{ name: 'FirstPastThePost', run }]
  }

  protected override nextOut(race: C[]): C[] {
    return this.resolvePending(this.bottomTwo(race)).eliminated
  }

  protected round(candidates: C[]): Step<C, undefined> {
    const pending = new Set(this.bottomTwo(candidates))
    const {
      qualified: q2,
      eliminated,
      tieBreakSteps,
    } = this.resolvePending([...pending])
    return {
      qualified: [...candidates.filter((c) => !pending.has(c)), ...q2],
      eliminated,
      scores: firstChoices(this.ballots, candidates),
      ...(tieBreakSteps.length > 0 && { tieBreakSteps }),
      ...this.openTie(eliminated, candidates),
    }
  }
}
