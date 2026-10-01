/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import { type Matrix, type ScoreObject } from '../../types'
import { pairwiseMatrix } from '../../utils/make-matrix'
import { sum } from '../../utils/sum'

const computeFromMatrix = <C extends string>(
  matrix: Matrix<C>,
): ScoreObject<C> => {
  const p = pairwiseMatrix(
    matrix.candidates.length,
    (i, j) => (Math.sign(matrix.array[i]![j]! - matrix.array[j]![i]!) + 1) / 2,
  )

  return Object.fromEntries(
    matrix.candidates.map((c, i) => [c, sum(p[i]!)]),
  ) as ScoreObject<C>
}

export class Copeland<C extends string> extends MatrixScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return computeFromMatrix(this.matrix)
  }
}
