import zipObject from 'lodash/zipObject'
import type { Matrix, ScoreObject } from '../../types'
import { findSmithSet, makeAntisymetric } from '../../utils'
import { scoresZero } from '../../utils/scores-zero'
import { RandomMatrixMethod } from '../../classes/random-matrix-method'
import { findNashEquilibrium } from '../../simplex/find-nash-equilibrium'

/**
 * * @alpha This voting system is not working correctly!
 * * @experimental This voting system is not working correctly!
 * * @deprecated This voting system is not working correctly!
 */
export const computeLottery = (
  _matrix: Matrix,
): { [candidate: string]: number } => {
  const matrix = makeAntisymetric(_matrix)
  const condorset = findSmithSet(matrix)

  const solution = findNashEquilibrium(condorset.array).map((v) =>
    Math.max(0, v),
  )

  return {
    ...scoresZero(matrix.candidates),
    ...zipObject(condorset.candidates, solution),
  }
}

/**
 * * @alpha This voting system is not working correctly!
 * * @experimental This voting system is not working correctly!
 * * @deprecated This voting system is not working correctly!
 */
export class MaximalLotteries extends RandomMatrixMethod {
  /**
   * * @alpha This voting system is not working correctly!
   * * @experimental This voting system is not working correctly!
   * * @deprecated This voting system is not working correctly!
   */
  public scores(): ScoreObject {
    return computeLottery(this.matrix)
  }
}
