import { RoundBallotMethodTb } from '../../classes/round-ballot-method-tb'
import type { QE, TieBreakStep } from '../../types'
import { scoresToRanking, scoresZero } from '../../utils'
import { majorityWinner } from '../absolute-majority'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

// Who gets through a cut: those the tiebreakers settle, and `spots` of the
// tie they leave at it.
type Cut<C extends string> = {
  through: C[]
  tied: C[]
  spots: number
}

/**
 * The two candidates with the most first choices go to a runoff, unless one of
 * them already has an absolute majority. A tie at the cut that the tiebreakers
 * cannot break sends everyone in it through, and the count then stops on those
 * who win the runoff of some pair breaking it gives.
 *
 * #### Wikipedia: [Two-round system](https://en.wikipedia.org/wiki/Two-round_system)
 */
export class TwoRoundRunoff<C extends string> extends RoundBallotMethodTb<C> {
  // The first round's, for a runoff of more than two.
  private cut: Cut<C> = { through: [], tied: [], spots: 0 }

  // The best `k` of `tied`, found by eliminating its bottom with the
  // tiebreakers.
  private narrow(tied: C[], k: number, steps: TieBreakStep<C>[]): Cut<C> {
    if (tied.length <= k) return { through: tied, tied: [], spots: 0 }
    const { qualified, eliminated, tieBreakSteps } = this.resolvePending(tied)
    steps.push(...tieBreakSteps)
    if (qualified.length === 0) return { through: [], tied, spots: k }
    if (qualified.length >= k) return this.narrow(qualified, k, steps)
    const rest = this.narrow(eliminated, k - qualified.length, steps)
    return { ...rest, through: [...qualified, ...rest.through] }
  }

  // The best `k` candidates on first choices.
  private top(candidates: C[], k: number): { round: QE<C>; cut: Cut<C> } {
    const scores = firstChoices(this.ballots, candidates)
    let cut: Cut<C> = { through: [], tied: [], spots: 0 }
    const tieBreakSteps: TieBreakStep<C>[] = []
    for (const tier of scoresToRanking(scores)) {
      if (cut.through.length + cut.tied.length >= k) break
      const next = this.narrow(tier, k - cut.through.length, tieBreakSteps)
      cut = { ...next, through: [...cut.through, ...next.through] }
    }
    const qualified = [...cut.through, ...cut.tied]
    return {
      round: {
        qualified,
        eliminated: candidates.filter((c) => !qualified.includes(c)),
        scores,
        ...(tieBreakSteps.length > 0 && { tieBreakSteps }),
      },
      cut,
    }
  }

  // Those who win the runoff of some pair that breaking the cut gives.
  private openRunoff(finalists: C[]): QE<C> {
    const { through, tied, spots } = this.cut
    const pairs =
      spots === 1
        ? tied.map((t) => [...through, t])
        : tied.flatMap((a, i) => tied.slice(i + 1).map((b) => [a, b]))
    const winners = new Set(
      pairs.flatMap((pair) => this.top(pair, 1).round.qualified),
    )
    return {
      qualified: finalists.filter((c) => winners.has(c)),
      eliminated: finalists.filter((c) => !winners.has(c)),
      scores: firstChoices(this.ballots, finalists),
    }
  }

  protected round(candidates: C[], index: number): QE<C> {
    // Runoff winners tied, after eliminating those below them.
    if (index > 1)
      return {
        qualified: [],
        eliminated: candidates,
        scores: scoresZero(candidates),
      }

    if (index === 1) {
      if (candidates.length > 2) return this.openRunoff(candidates)
      const { round } = this.top(candidates, 1)
      // Tied all the way: no later round can separate them.
      return round.qualified.length === candidates.length
        ? { ...round, qualified: [], eliminated: candidates }
        : round
    }

    const scores = firstChoices(this.ballots, candidates)
    const winner = majorityWinner(scores, this.castBallots(candidates))
    if (winner !== undefined)
      return {
        qualified: [winner],
        eliminated: candidates.filter((c) => c !== winner),
        scores,
      }
    const { round, cut } = this.top(candidates, 2)
    this.cut = cut
    return round
  }
}
