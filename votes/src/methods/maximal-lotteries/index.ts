import zipObject from 'lodash/zipObject'
import type { Matrix, ScoreObject } from '../../types'
import { findSmithSet, makeAntisymetric } from '../../utils'
import { scoresZero } from '../../utils/scores-zero'
import { RandomMatrixMethod } from '../../classes/random-matrix-method'
import { findNashEquilibrium } from '../../simplex/find-nash-equilibrium'

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

export class MaximalLotteries extends RandomMatrixMethod {
  public scores(): ScoreObject {
    return computeLottery(this.matrix)
  }
}
