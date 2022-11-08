import range from 'lodash/range'
import type { Matrix, ScoreObject } from '../../types'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'

const computeFromMatrix = (matrix: Matrix): ScoreObject => {
  const n = matrix.candidates.length
  const p: number[][] = range(n).map(() => range(n).map(() => 0))

  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (i !== j)
        if (matrix.array[i][j] > matrix.array[j][i])
          p[i][j] = matrix.array[i][j]
        else p[i][j] = 0

  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (i !== j)
        for (let k = 0; k < n; k++)
          if (i !== k && j !== k)
            p[j][k] = Math.max(p[j][k], Math.min(p[j][i], p[i][k]))

  const s: ScoreObject = {}
  for (const [k, c] of matrix.candidates.entries())
    s[c] = p[k].filter((v, k2) => v > p[k2][k]).length

  return s
}

/**
 * #### Wikipedia: [Schulze method](https://en.wikipedia.org/wiki/Schulze_method)
 */
export class Schulze extends MatrixScoreMethod {
  public scores(): ScoreObject {
    return computeFromMatrix(this.matrix)
  }
}
