import { zipObject } from 'lodash-es'
import { RandomMatrixMethod } from '../../classes/random-matrix-method'
import { findNashEquilibrium } from '../../simplex/find-nash-equilibrium'
import type { Matrix, ScoreObject } from '../../types'
import { findSmithSet, makeAntisymmetric } from '../../utils'
import { scoresZero } from '../../utils/scores-zero'

export const computeLottery = <C extends string>(
  _matrix: Matrix<C>,
): Record<C, number> => {
  const matrix = makeAntisymmetric(_matrix)
  const condorset = findSmithSet(matrix)

  const solution = findNashEquilibrium(condorset.array).map((v) =>
    Math.max(0, v),
  )

  return {
    ...scoresZero(matrix.candidates),
    ...zipObject(condorset.candidates, solution),
  }
}

export class MaximalLotteries<C extends string> extends RandomMatrixMethod<C> {
  public scores(): ScoreObject<C> {
    return computeLottery(this.matrix)
  }
}
