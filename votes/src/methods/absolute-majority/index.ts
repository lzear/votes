import { BallotScoreMethod } from '../../classes/ballot-score-method'
import { type Ballot, type ScoreObject } from '../../types'
import { totalBallotsWeight } from '../../utils'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

// The candidate scoring more than half the weight of `ballots`, if any: at
// most one can.
export const majorityWinner = <C extends string>(
  scores: ScoreObject<C>,
  ballots: Ballot<C>[],
): C | undefined => {
  const half = totalBallotsWeight(ballots) / 2
  return (Object.keys(scores) as C[]).find((c) => scores[c] > half)
}

/**
 * #### Wikipedia: [Majority](https://en.wikipedia.org/wiki/Majority)
 */
export class AbsoluteMajority<C extends string> extends BallotScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return firstChoices(this.ballots, this.candidates)
  }

  public override ranking(): C[][] {
    const top = majorityWinner(this.scores(), this.castBallots(this.candidates))
    const tiers =
      top === undefined
        ? [this.candidates]
        : [[top], this.candidates.filter((c) => c !== top)]
    return tiers.filter((tier) => tier.length > 0)
  }
}
