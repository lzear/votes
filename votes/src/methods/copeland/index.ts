import { range, zipObject } from 'lodash-es'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, ScoreObject } from '../../types'

const computeFromMatrix = <C extends string>(
  matrix: Matrix<C>,
): ScoreObject<C> => {
  const n = matrix.candidates.length

  const p: number[][] = range(n).map(() => range(n).map(() => 0))
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (i !== j)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        p[i]![j] =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (Math.sign(matrix.array[i]![j]! - matrix.array[j]![i]!) + 1) / 2

  const scores = p.map((m) => m.reduce((acc, cur) => acc + cur, 0))

  return zipObject(matrix.candidates, scores) as ScoreObject<C>
}

export class Copeland<C extends string> extends MatrixScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return computeFromMatrix(this.matrix)
  }
}
