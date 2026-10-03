import { RoundBallotMethodTb } from '../../classes/round-ballot-method-tb'
import { type QE, type TieBreakStep } from '../../types'
import { scoresToRanking } from '../../utils'
import { AbsoluteMajority } from '../absolute-majority'
import { FirstPastThePost } from '../first-past-the-post'

/**
 * The two candidates with the most first choices go to a runoff, unless one of
 * them already has an absolute majority. A tie at the cut that the tiebreakers
 * cannot break sends everyone in it through.
 *
 * #### Wikipedia: [Two-round system](https://en.wikipedia.org/wiki/Two-round_system)
 */
export class TwoRoundRunoff<C extends string> extends RoundBallotMethodTb<C> {
  // The best `k` of `tied`, found by eliminating its bottom with the
  // tiebreakers. More than `k` when they cannot settle the cut.
  private narrow(tied: C[], k: number, steps: TieBreakStep<C>[]): C[] {
    if (tied.length <= k) return tied
    const { qualified, eliminated, tieBreakSteps } = this.resolvePending(tied)
    steps.push(...tieBreakSteps)
    if (qualified.length === 0) return tied
    return qualified.length >= k
      ? this.narrow(qualified, k, steps)
      : [...qualified, ...this.narrow(eliminated, k - qualified.length, steps)]
  }

  // The best `k` candidates on first choices.
  private top(candidates: C[], k: number): QE<C> {
    const scores = new FirstPastThePost({
      ballots: this.ballots,
      candidates,
    }).scores()
    const qualified: C[] = []
    const tieBreakSteps: TieBreakStep<C>[] = []
    for (const tier of scoresToRanking(scores)) {
      if (qualified.length >= k) break
      qualified.push(...this.narrow(tier, k - qualified.length, tieBreakSteps))
    }
    const through = new Set(qualified)
    return {
      qualified,
      eliminated: candidates.filter((c) => !through.has(c)),
      scores,
      ...(tieBreakSteps.length > 0 && { tieBreakSteps }),
    }
  }

  protected round(candidates: C[], index: number): QE<C> {
    // A runoff that ended in a tie, after eliminating those below it.
    if (index > 1)
      return {
        qualified: [],
        eliminated: candidates,
        scores: this.roundScoresZero(candidates),
      }

    if (index === 1) {
      const runoff = this.top(candidates, 1)
      // Tied all the way: no later round can separate them.
      return runoff.qualified.length === candidates.length
        ? { ...runoff, qualified: [], eliminated: candidates }
        : runoff
    }

    const am = new AbsoluteMajority({ ballots: this.ballots, candidates })
    const [winner = [], ...rest] = am.ranking()
    return winner.length === 1
      ? { qualified: winner, eliminated: rest.flat(), scores: am.scores() }
      : this.top(candidates, 2)
  }
}
