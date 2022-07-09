import type { Matrix, ScoreObject } from '../../types'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'

export enum MinimaxVariant {
  WinningVotes = 'WINNING_VOTES',
  Margins = 'MARGINS',
  PairwiseOpposition = 'PAIRWISE_OPPOSITION',
}

const scoreXY = {
  [MinimaxVariant.WinningVotes]: (xOverY: number, yOverX: number) =>
    xOverY > yOverX ? xOverY : 0,
  [MinimaxVariant.Margins]: (xOverY: number, yOverX: number) => xOverY - yOverX,
  [MinimaxVariant.PairwiseOpposition]: (xOverY: number) => xOverY,
}

const computeScores = (
  matrix: Matrix,
  variant: MinimaxVariant,
): ScoreObject => {
  const s: ScoreObject = {}
  for (const [k, c] of matrix.candidates.entries()) {
    s[c] = -Math.max(
      ...matrix.array[k].map((v, k2) =>
        scoreXY[variant](matrix.array[k2][k], v),
      ),
    )
  }
  return s
}

export class Minimax extends MatrixScoreMethod {
  public minimaxVariant: MinimaxVariant

  public static Variants = MinimaxVariant

  constructor(i: Matrix & { variant?: MinimaxVariant }) {
    super(i)
    this.minimaxVariant = i.variant || MinimaxVariant.Margins
  }

  public scores(): ScoreObject {
    return computeScores(this.matrix, this.minimaxVariant)
  }
}
