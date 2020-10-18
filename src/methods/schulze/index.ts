/* eslint-disable no-plusplus */
import * as _ from 'lodash'
import { SystemUsingMatrix, VotingSystem, Matrix, ScoreObject } from '../../types'

/**
 * https://en.wikipedia.org/wiki/Schulze_method
 */
const schulze: SystemUsingMatrix = {
  type: VotingSystem.Schulze,
  computeFromMatrix(matrix: Matrix): ScoreObject {
    const n = matrix.candidates.length
    const p: number[][] = _.range(n).map(() => _.range(n).map(() => 0))

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          if (matrix.array[i][j] > matrix.array[j][i]) p[i][j] = matrix.array[i][j]
          else p[i][j] = 0
        }
      }
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          for (let k = 0; k < n; k++) {
            if (i !== k && j !== k) {
              p[j][k] = Math.max(p[j][k], Math.min(p[j][i], p[i][k]))
            }
          }
        }
      }
    }
    const s: ScoreObject = {}
    matrix.candidates.forEach((c, k) => {
      s[c] = p[k].filter((v, k2) => v > p[k2][k]).length
    })
    return s
  },
}

export default schulze
