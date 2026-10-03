import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import { type ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { matrixBordaScores } from '../borda'

/**
 * Iterative {@link Borda | Borda count} in which, each round, candidates scoring the lowest score are eliminated.
 * Scores come from the pairwise matrix, so a Condorcet winner always wins.
 */
export class Baldwin<C extends string> extends TbEliminateLast<C> {
  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = matrixBordaScores(this.matrix, this.ballots, candidates)
    return { ranking: scoresToRanking(scores), scores }
  }
}
