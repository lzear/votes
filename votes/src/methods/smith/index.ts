import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, ScoreObject } from '../../types'
import { findSmithSet } from '../../utils/condorcet'
import { scoresAny } from '../../utils/scores-zero'

const computeScores = (matrix: Matrix): ScoreObject => {
  const smithSet = findSmithSet(matrix)
  return {
    // give all non-Smith-set candidates a score of 0
    // and all the Smith set a score of 1
    ...scoresAny(matrix.candidates, 0),
    ...scoresAny(smithSet.candidates, 1),
  }
}

/**
 * #### Wikipedia: [Smith's method](https://en.wikipedia.org/wiki/Smith_set#Smith's_method)
 */
export class Smith extends MatrixScoreMethod {
  public scores(): ScoreObject {
    return computeScores(this.matrix)
  }
}
