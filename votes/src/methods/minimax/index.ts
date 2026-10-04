/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import { type Matrix, type Profile, type ScoreObject } from '../../types'

export const MinimaxVariant = {
  WinningVotes: 'WINNING_VOTES',
  Margins: 'MARGINS',
  PairwiseOpposition: 'PAIRWISE_OPPOSITION',
} as const
export type MinimaxVariant =
  (typeof MinimaxVariant)[keyof typeof MinimaxVariant]

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
): ScoreObject<C> =>
  Object.fromEntries(
    matrix.candidates.map((candidate, c1Index) => {
      // [votes against, votes for] in each duel.
      const duels = matrix.array[c1Index]!.flatMap(
        (yOverX, c2Index): [number, number][] =>
          c2Index === c1Index
            ? []
            : [[matrix.array[c2Index]![c1Index]!, yOverX]],
      )
      // Ties left out, unless they are all there is.
      const counted =
        excludeTies && duels.some(([x, y]) => x !== y)
          ? duels.filter(([x, y]) => x !== y)
          : duels
      return [
        candidate,
        -Math.max(...counted.map(([x, y]) => scoreXY[variant](x, y))),
      ]
    }),
  ) as ScoreObject<C>

/**
 * #### Wikipedia: [Minimax Condorcet method](https://en.wikipedia.org/wiki/Minimax_Condorcet_method)
 */
export class Minimax<C extends string> extends MatrixScoreMethod<C> {
  public readonly minimaxVariant: MinimaxVariant
  public readonly excludeTies: boolean

  constructor(
    i: (Matrix<C> | Profile<C>) & {
      variant?: MinimaxVariant
      excludeTies?: boolean
    },
  ) {
    super(i)
    this.minimaxVariant = i.variant ?? MinimaxVariant.Margins
    this.excludeTies = i.excludeTies ?? false
  }

  public scores(): ScoreObject<C> {
    return computeScores(this.matrix, this.minimaxVariant, this.excludeTies)
  }
}
