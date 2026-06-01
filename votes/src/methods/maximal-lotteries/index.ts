import { zipObject } from 'lodash-es'
import { RandomMatrixMethod } from '../../classes/random-matrix-method'
import { findNashEquilibrium } from '../../simplex/find-nash-equilibrium'
import type { Matrix, ScoreObject } from '../../types'
import { findSmithSet, makeAntisymmetric, scoresZero } from '../../utils'

export const lotteryFromAntisymmetric = <C extends string>(
  matrix: Matrix<C>,
): Record<C, number> => {
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
    return lotteryFromAntisymmetric(makeAntisymmetric(this.matrix))
  }
}
