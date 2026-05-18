import { RandomMatrixMethod } from '../../classes/random-matrix-method'
import type { Matrix, ScoreObject } from '../../types'
import { makeAntisymmetric } from '../../utils'
import { computeLottery } from '../maximal-lotteries'

const computeScores = <C extends string>(matrix: Matrix<C>): ScoreObject<C> => {
  const antisymetric = makeAntisymmetric(matrix)
  const antisymetricUnit = {
    ...antisymetric,
    array: antisymetric.array.map((r) => r.map((v) => Math.sign(v))),
  }
  return computeLottery(antisymetricUnit)
}

export class RandomizedCondorcet<
  C extends string,
> extends RandomMatrixMethod<C> {
  public scores(): ScoreObject<C> {
    return computeScores(this.matrix)
  }
}
