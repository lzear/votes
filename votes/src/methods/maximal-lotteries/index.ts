import { RandomMatrixMethod } from '../../classes/random-matrix-method'
import { findNashEquilibrium } from '../../simplex/find-nash-equilibrium'
import type { Matrix, ScoreObject } from '../../types'
import { findSmithSet, makeAntisymmetric, scoresZero } from '../../utils'
import { subMatrix } from '../../utils/make-matrix'

export const lotteryFromAntisymmetric = <C extends string>(
  matrix: Matrix<C>,
): Record<C, number> => {
  // In a fixed order: when several lotteries are maximal, the one found then
  // does not depend on the order candidates come in.
  const condorset = findSmithSet(
    subMatrix(
      matrix,
      matrix.candidates.toSorted((a, b) => (a < b ? -1 : Number(a > b))),
    ),
  )

  const solution = findNashEquilibrium(condorset.array).map((v) =>
    Math.max(0, v),
  )

  return {
    ...scoresZero(matrix.candidates),
    ...Object.fromEntries(condorset.candidates.map((c, i) => [c, solution[i]])),
  }
}

/**
When several lotteries are maximal, returns one, the same whatever the
candidate order.

#### Wikipedia: [Maximal lotteries](https://en.wikipedia.org/wiki/Maximal_lotteries)
*/
export class MaximalLotteries<C extends string> extends RandomMatrixMethod<C> {
  public static readonly label = 'MaximalLotteries'

  public probabilities(): ScoreObject<C> {
    return lotteryFromAntisymmetric(makeAntisymmetric(this.matrix))
  }
}
