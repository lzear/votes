/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { zipObject } from 'lodash-es'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, ScoreObject } from '../../types'
import { pairwiseMatrix } from '../../utils/make-matrix'

const computeFromMatrix = <C extends string>(
  matrix: Matrix<C>,
): ScoreObject<C> => {
  const p = pairwiseMatrix(
    matrix.candidates.length,
    (i, j) => (Math.sign(matrix.array[i]![j]! - matrix.array[j]![i]!) + 1) / 2,
  )

  const scores = p.map((m) => m.reduce((acc, cur) => acc + cur, 0))

  return zipObject(matrix.candidates, scores) as ScoreObject<C>
}

export class Copeland<C extends string> extends MatrixScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return computeFromMatrix(this.matrix)
  }
}
