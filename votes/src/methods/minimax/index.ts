import type { Matrix, ScoreObject } from '../../types'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'

export enum MinimaxVariant {
  WinningVotes = 'WINNING_VOTES',
  Margins = 'MARGINS',
  PairwiseOpposition = 'PAIRWISE_OPPOSITION',
}

const scoreXY = {
  [MinimaxVariant.Margins]: (xOverY: number, yOverX: number) => xOverY - yOverX, // default
  [MinimaxVariant.PairwiseOpposition]: (xOverY: number) => xOverY,
  [MinimaxVariant.WinningVotes]: (xOverY: number, yOverX: number) =>
    xOverY > yOverX ? xOverY : 0,
}

const computeScores = (
  matrix: Matrix,
  variant: MinimaxVariant,
): ScoreObject => {
  const s: ScoreObject = {}
  for (const [c1Index, candidate] of matrix.candidates.entries()) {
    s[candidate] = -Math.max(
      ...matrix.array[c1Index]
        .map((v, c2Index) =>
          scoreXY[variant](matrix.array[c2Index][c1Index], v),
        )
        .filter((_, c2Index) => c2Index !== c1Index),
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
