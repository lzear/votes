import { RandomMatrixMethod } from '../../classes/random-matrix-method'
import type { Matrix, ScoreObject } from '../../types'
import { makeAntisymmetric } from '../../utils'
import { lotteryFromAntisymmetric } from '../maximal-lotteries'

const computeScores = <C extends string>(matrix: Matrix<C>): ScoreObject<C> => {
  const signMatrix = {
    candidates: matrix.candidates,
    array: makeAntisymmetric(matrix).array.map((r) =>
      r.map((v) => Math.sign(v)),
    ),
  }
  return lotteryFromAntisymmetric(signMatrix)
}

export class RandomizedCondorcet<
  C extends string,
> extends RandomMatrixMethod<C> {
  public scores(): ScoreObject<C> {
    return computeScores(this.matrix)
  }
}
