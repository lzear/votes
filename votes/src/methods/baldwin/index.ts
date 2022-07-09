import _ from 'lodash'

import type { Ballot, ScoreObject } from '../../types'
import { Borda } from '../borda'
import { RoundBallotMethod } from '../../classes/round-ballot-method'

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

  const eliminated = ranking.at(-1) || []
  const qualified = _.difference(candidates, eliminated)

  return { eliminated, qualified, scores: borda.scores() }
}

export class Baldwin extends RoundBallotMethod {
  protected round(candidates: string[]): {
    qualified: string[]
    eliminated: string[]
    scores: ScoreObject
  } {
    return round(candidates, this.ballots)
  }
}
