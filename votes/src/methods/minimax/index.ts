import { Matrix, ScoreObject } from '../../types'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'

const computeScores = (matrix: Matrix): ScoreObject => {
  const s: ScoreObject = {}
  for (const [k, c] of matrix.candidates.entries()) {
    s[c] = -Math.max(...matrix.array[k].map((v, k2) => matrix.array[k2][k] - v))
  }
  return s
}

export class Minimax extends MatrixScoreMethod {
  public scores(): ScoreObject {
    return computeScores(this.matrix)
  }
}
