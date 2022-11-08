import sum from 'lodash/sum'
import type { Ballot, ScoreObject } from '../../types'
import _ from 'lodash'
import { RoundBallotMethod } from '../../classes/round-ballot-method'
import { Borda } from '../borda'

const round = (
  candidates: string[],
  ballots: Ballot[],
): {
  qualified: string[]
  eliminated: string[]
  scores: ScoreObject
} => {
  const borda = new Borda({ candidates, ballots })
  const bordaScores = borda.scores()
  const scores = Object.values(bordaScores)
  const avg = sum(scores) / scores.length
  const eliminated = candidates.filter((c) => bordaScores[c] <= avg)
  const qualified = _.difference(candidates, eliminated)
  return { eliminated, qualified, scores: bordaScores }
}

/**
 * #### Wikipedia: [Nanson's method](https://en.wikipedia.org/wiki/Nanson%27s_method)
 */
export class Nanson extends RoundBallotMethod {
  protected round(candidates: string[]): {
    qualified: string[]
    eliminated: string[]
    scores: ScoreObject
  } {
    return round(candidates, this.ballots)
  }
}
