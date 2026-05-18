import { difference } from 'lodash-es'
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

  const ranking = borda.ranking()

  const eliminated = ranking.at(-1) ?? []
  const qualified = difference(candidates, eliminated)

  return { eliminated, qualified, scores: borda.scores() }
}

/**
 * Iterative {@link Borda | Borda count} in which, each round, candidates scoring the lowest score are eliminated.
 */
export class Baldwin<C extends string> extends RoundBallotMethod<C> {
  protected round(candidates: C[]): {
    qualified: C[]
    eliminated: C[]
    scores: ScoreObject<C>
  } {
    return round(candidates, this.ballots)
  }
}
