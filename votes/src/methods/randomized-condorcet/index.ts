import type { Matrix, ScoreObject } from '../../types'
import { makeAntisymetric } from '../../utils'
import { computeLottery } from '../maximal-lotteries'
import { RandomMatrixMethod } from '../../classes/random-matrix-method'

/**
 * * @alpha This voting system is not working correctly!
 * * @experimental This voting system is not working correctly!
 * * @deprecated This voting system is not working correctly!
 */
const computeScores = (matrix: Matrix): ScoreObject => {
  const antisymetric = makeAntisymetric(matrix)
  const antisymetricUnit = {
    ...antisymetric,
    array: antisymetric.array.map((r) => r.map((v) => Math.sign(v))),
  }
  return computeLottery(antisymetricUnit)
}

/**
 * * @alpha This voting system is not working correctly!
 * * @experimental This voting system is not working correctly!
 * * @deprecated This voting system is not working correctly!
 */
export class RandomizedCondorcet extends RandomMatrixMethod {
  /**
   * * @alpha This voting system is not working correctly!
   * * @experimental This voting system is not working correctly!
   * * @deprecated This voting system is not working correctly!
   */
  public scores(): ScoreObject {
    return computeScores(this.matrix)
  }
}
