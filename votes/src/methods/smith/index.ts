import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, ScoreObject } from '../../types'
import { findSmithSet, scoresAny } from '../../utils'

const computeScores = <C extends string>(matrix: Matrix<C>): ScoreObject<C> => {
  const smithSet = findSmithSet(matrix)
  return {
    // give all non-Smith-set candidates a score of 0
    // and all the Smith set a score of 1
    ...scoresAny(matrix.candidates, 0),
    ...scoresAny(smithSet.candidates, 1),
  }
}

/**
Ranks the Smith set first, everyone else tied below. Scores are 1 for the
Smith set and 0 for the others.

#### Wikipedia: [Smith's method](https://en.wikipedia.org/wiki/Smith_set#Smith's_method)
*/
export class Smith<C extends string> extends MatrixScoreMethod<C> {
  public static readonly label = 'Smith'

  public scores(): ScoreObject<C> {
    return computeScores(this.matrix)
  }
}
