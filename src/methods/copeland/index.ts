/* eslint-disable no-plusplus */
import { range, zipObject } from 'lodash-es'
import {
  SystemUsingMatrix,
  VotingSystem,
  Matrix,
  ScoreObject,
} from '../../types'

/**
 * https://en.wikipedia.org/wiki/Copeland%27s_method
 */
export const copeland: SystemUsingMatrix = {
  type: VotingSystem.Copeland,
  computeFromMatrix(matrix: Matrix): ScoreObject {
    const n = matrix.candidates.length

    const p: number[][] = range(n).map(() => range(n).map(() => 0))
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          p[i][j] = Math.sign(matrix.array[i][j] - matrix.array[j][i])
        }
      }
    }

    // First order
    const scores1 = p.map((m) => m.reduce((acc, cur) => acc + cur, 0))

    // Second order
    const scores2 = scores1.map(
      (s, k) =>
        s +
        p[k].reduce((acc, cur, k2) => acc + (cur > 0 ? scores1[k2] : 0), 0) /
          (n * n),
    )
    return zipObject(matrix.candidates, scores2)
  },
}
