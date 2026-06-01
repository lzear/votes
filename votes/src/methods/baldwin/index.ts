import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { Borda } from '../borda'

/**
 * Iterative {@link Borda | Borda count} in which, each round, candidates scoring the lowest score are eliminated.
 */
export class Baldwin<C extends string> extends TbEliminateLast<C> {
  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = new Borda({ candidates, ballots: this.ballots }).scores()
    return { ranking: scoresToRanking(scores), scores }
  }
}
