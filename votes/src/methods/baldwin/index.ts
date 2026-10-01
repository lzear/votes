import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import { type ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { bordaScores } from '../borda'

/**
 * Iterative {@link Borda | Borda count} in which, each round, candidates scoring the lowest score are eliminated.
 */
export class Baldwin<C extends string> extends TbEliminateLast<C> {
  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = bordaScores(this.ballots, candidates)
    return { ranking: scoresToRanking(scores), scores }
  }
}
