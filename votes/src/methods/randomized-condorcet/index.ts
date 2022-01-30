import { Matrix, ScoreObject } from '../../types'
import { makeAntisymetric } from '../../utils'
import { computeLottery } from '../maximal-lotteries'
import { RandomMatrixMethod } from '../../classes/random-matrix-method'

const computeScores = (matrix: Matrix): ScoreObject => {
  const antisymetric = makeAntisymetric(matrix)
  const antisymetricUnit = {
    ...antisymetric,
    array: antisymetric.array.map((r) => r.map((v) => Math.sign(v))),
  }
  return computeLottery(antisymetricUnit)
}

export class RandomizedCondorcet extends RandomMatrixMethod {
  public scores(): ScoreObject {
    return computeScores(this.matrix)
  }
}
