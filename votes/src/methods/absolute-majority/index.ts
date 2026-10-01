import { BallotScoreMethod } from '../../classes/ballot-score-method'
import { type ScoreObject } from '../../types'
import { totalBallotsWeight } from '../../utils'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

// The candidate with more than half of `total`, if any: at most one can be.
export const majorityWinner = <C extends string>(
  scores: ScoreObject<C>,
  total: number,
): C | undefined =>
  (Object.keys(scores) as C[]).find((c) => scores[c] > total / 2)

/**
 * #### Wikipedia: [Majority](https://en.wikipedia.org/wiki/Majority)
 */
export class AbsoluteMajority<C extends string> extends BallotScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return firstChoices(this.ballots, this.candidates)
  }

  public ranking(): C[][] {
    const top = majorityWinner(this.scores(), totalBallotsWeight(this.ballots))
    const tiers =
      top === undefined
        ? [this.candidates]
        : [[top], this.candidates.filter((c) => c !== top)]
    return tiers.filter((tier) => tier.length > 0)
  }
}
