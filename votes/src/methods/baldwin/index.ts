import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { subMatrix } from '../../utils/make-matrix'
import { matrixBordaScores } from '../borda'

/**
Iterative {@link Borda | Borda count} in which, each round, candidates scoring the lowest score are eliminated.
Scores come from the pairwise matrix, so a Condorcet winner always wins.

#### Wikipedia: [Baldwin method](https://en.wikipedia.org/wiki/Nanson%27s_method#Baldwin_method)
*/
export class Baldwin<C extends string> extends TbEliminateLast<C> {
  public static readonly label = 'Baldwin'

  // A Condorcet winner, whose Borda score stays above the average.
  protected override sureWinner(race: C[]): C | undefined {
    const { array } = subMatrix(this.matrix, race)
    return race.find((_, i) =>
      array.every((row, j) => i === j || (array[i]?.[j] ?? 0) > (row[i] ?? 0)),
    )
  }

  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = matrixBordaScores(this.matrix, this.ballots, candidates)
    return { ranking: scoresToRanking(scores), scores }
  }
}
