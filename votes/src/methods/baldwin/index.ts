import _ from 'lodash-es'

import { RoundBallotMethod } from '../../classes/round-ballot-method'
import type { Ballot, ScoreObject } from '../../types'
import { arrayAt } from '../../utils/array-at'
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

  const ranking = borda.ranking()

  const eliminated = arrayAt(ranking, -1) || []
  const qualified = _.difference(candidates, eliminated)

  return { eliminated, qualified, scores: borda.scores() }
}

/**
 * Iterative {@link Borda | Borda count} in which, each round, candidates scoring the lowest score are eliminated.
 */
export class Baldwin extends RoundBallotMethod {
  protected round(candidates: string[]): {
    qualified: string[]
    eliminated: string[]
    scores: ScoreObject
  } {
    return round(candidates, this.ballots)
  }
}
