import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { Ballot, ScoreObject } from '../../types'
import { scoresZero, totalBallotsWeight, weightOf } from '../../utils'
import { config } from '../../utils/config'

// Weight of the ballots placing each candidate within their first `depth`
// places, a tier across the cut counting for its share of places within: at
// depth 1, first choices.
const placedWithin = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  depth: number,
): ScoreObject<C> => {
  const scores = scoresZero(candidates)
  const running = new Set(candidates)
  for (const ballot of ballots) {
    const weight = weightOf(ballot)
    let place = 0
    for (const rank of ballot.ranking) {
      const tier = rank.filter((c) => running.has(c))
      const within = Math.min(Math.max(depth - place, 0), tier.length)
      const share = within / tier.length
      for (const candidate of tier) scores[candidate] += share * weight
      place += tier.length
    }
  }
  return scores
}

/**
 * Adds each voter's next choice to the count until someone has an absolute
 * majority, then the most votes wins. Scores are that last count, a tier
 * across its cut counting for its share of places within.
 *
 * #### Wikipedia: [Bucklin voting](https://en.wikipedia.org/wiki/Bucklin_voting)
 */
export class Bucklin<C extends string> extends BallotScoreMethod<C> {
  public static readonly label = 'Bucklin'

  public scores(): ScoreObject<C> {
    const half =
      totalBallotsWeight(this.castBallots(this.candidates)) / 2 + config.EPSILON
    let scores = scoresZero(this.candidates)
    for (let depth = 1; depth <= this.candidates.length; depth++) {
      scores = placedWithin(this.ballots, this.candidates, depth)
      if (Object.values<number>(scores).some((s) => s > half)) break
    }
    return scores
  }
}
