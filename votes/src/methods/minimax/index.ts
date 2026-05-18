/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, ScoreObject } from '../../types'

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

const computeScores = <C extends string>(
  matrix: Matrix<C>,
  variant: MinimaxVariant,
  excludeTies: boolean,
): ScoreObject<C> => {
  const s = {} as ScoreObject<C>
  for (const [c1Index, candidate] of matrix.candidates.entries())
    s[candidate] = -Math.max(
      ...matrix.array[c1Index]!.map((yOverX, c2Index) => {
        const xOverY = matrix.array[c2Index]![c1Index]
        return xOverY === yOverX && excludeTies
          ? null
          : scoreXY[variant](xOverY, yOverX)
      })
        .filter((_, c2Index) => c2Index !== c1Index)
        .filter((v) => v !== null),
    )

  return s
}

/**
 * #### Wikipedia: [Minimax Condorcet method](https://en.wikipedia.org/wiki/Minimax_Condorcet_method)
 */
export class Minimax<C extends string> extends MatrixScoreMethod<C> {
  public minimaxVariant: MinimaxVariant
  public excludeTies: boolean

  public static Variants = MinimaxVariant

  constructor(
    i: Matrix<C> & { variant?: MinimaxVariant; excludeTies?: boolean },
  ) {
    super(i)
    this.minimaxVariant = i.variant ?? MinimaxVariant.Margins
    this.excludeTies = i.excludeTies ?? false
  }

  public scores(): ScoreObject<C> {
    return computeScores(this.matrix, this.minimaxVariant, this.excludeTies)
  }
}
