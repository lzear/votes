import zipObject from 'lodash/zipObject'
import { solve } from '../../simplex'
import type { Matrix, ScoreObject } from '../../types'
import { findSmithSet } from '../../utils/condorcet'
import { makeAntisymetric } from '../../utils'
import { scoresZero } from '../../utils/scores-zero'
import { RandomMatrixMethod } from '../../classes/random-matrix-method'

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

  const subVector = solve(condorset.array).map((v) => Math.max(0, v))

  // Fixups because I can't implement the simplex algorithm correctly
  //  ---------- Begin ----------
  const sum = subVector.reduce((acc, cur) => acc + cur, 0)
  const normalizedVector = subVector.map((v) => v / sum)
  //  ----------  End  ----------

  return {
    ...scoresZero(matrix.candidates),
    ...zipObject(condorset.candidates, normalizedVector),
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
