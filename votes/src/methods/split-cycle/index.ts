/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, ScoreObject } from '../../types'
import { pairwiseMatrix } from '../../utils/make-matrix'
import { winStrength } from '../../utils/strength'
import { beatpaths, scoresFromStrengths } from '../schulze'

/**
1 where the row's candidate defeats the column's: it wins by a margin above
the strongest path back, so that the cycles through the win all have a
weaker link.
*/
export const splitCycleDefeats = <C extends string>(
  matrix: Matrix<C>,
): number[][] => {
  const { array, candidates } = matrix
  const back = beatpaths(matrix, 'margins')
  return pairwiseMatrix(candidates.length, (i, j) =>
    array[i]![j]! > array[j]![i]! &&
    winStrength('margins', array[i]![j]!, array[j]![i]!) > back[j]![i]!
      ? 1
      : 0,
  )
}

/**
Splits every majority cycle at its weakest margins: the wins left are
defeats. The winners are the undefeated, then those only they defeat, and
so on.

#### Holliday & Pacuit: [Split Cycle](https://arxiv.org/abs/2004.02350)
*/
export class SplitCycle<C extends string> extends MatrixScoreMethod<C> {
  public static readonly label = 'SplitCycle'

  public scores(): ScoreObject<C> {
    return scoresFromStrengths(
      this.matrix.candidates,
      splitCycleDefeats(this.matrix),
    )
  }
}
