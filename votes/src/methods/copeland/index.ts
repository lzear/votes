import _ from 'lodash'
import { Matrix, ScoreObject } from '../../types'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'

const computeFromMatrix = (matrix: Matrix) => {
  const n = matrix.candidates.length

  const p: number[][] = _.range(n).map(() => _.range(n).map(() => 0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        p[i][j] = (Math.sign(matrix.array[i][j] - matrix.array[j][i]) + 1) / 2
      }
    }
  }

  const scores = p.map((m) => m.reduce((acc, cur) => acc + cur, 0))

  return _.zipObject(matrix.candidates, scores)
}

export class Copeland extends MatrixScoreMethod {
  public scores(): ScoreObject {
    return computeFromMatrix(this.matrix)
  }
}
