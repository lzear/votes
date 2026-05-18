import { difference, sum } from 'lodash-es'
import { RoundBallotMethod } from '../../classes/round-ballot-method'
import type { Ballot, ScoreObject } from '../../types'
import { Borda } from '../borda'

const round = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
): {
  qualified: C[]
  eliminated: C[]
  scores: ScoreObject<C>
} => {
  const borda = new Borda({ candidates, ballots })
  const bordaScores = borda.scores()
  const scores = Object.values(bordaScores)
  const avg = sum(scores) / scores.length
  const eliminated = candidates.filter((c) => bordaScores[c] <= avg)
  const qualified = difference(candidates, eliminated)
  return { eliminated, qualified, scores: bordaScores }
}

/**
 * #### Wikipedia: [Nanson's method](https://en.wikipedia.org/wiki/Nanson%27s_method)
 */
export class Nanson<C extends string> extends RoundBallotMethod<C> {
  protected round(candidates: C[]): {
    qualified: C[]
    eliminated: C[]
    scores: ScoreObject<C>
  } {
    return round(candidates, this.ballots)
  }
}
