/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, Profile, ScoreObject } from '../../types'

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

/**
A candidate's worst result: the largest `defeat` (by the variant's measure,
negative when it wins every duel by margins) and the `opponents` inflicting
it.
*/
export type WorstDefeat<C extends string> = {
  opponents: C[]
  defeat: number
}

const computeWorstDefeats = <C extends string>(
  matrix: Matrix<C>,
  variant: MinimaxVariant,
  excludeTies: boolean,
): Record<C, WorstDefeat<C>> =>
  Object.fromEntries(
    matrix.candidates.map((candidate, c1Index) => {
      // Opponent, votes against, votes for in each duel.
      const duels = matrix.array[c1Index]!.flatMap(
        (yOverX, c2Index): [C, number, number][] =>
          c2Index === c1Index
            ? []
            : [
                [
                  matrix.candidates[c2Index]!,
                  matrix.array[c2Index]![c1Index]!,
                  yOverX,
                ],
              ],
      )
      // Ties left out, unless they are all there is.
      const counted =
        excludeTies && duels.some(([, x, y]) => x !== y)
          ? duels.filter(([, x, y]) => x !== y)
          : duels
      const defeats = counted.map(
        ([opponent, x, y]) => [opponent, scoreXY[variant](x, y)] as const,
      )
      const defeat = Math.max(...defeats.map(([, d]) => d))
      return [
        candidate,
        {
          opponents: defeats.filter(([, d]) => d === defeat).map(([o]) => o),
          defeat,
        },
      ]
    }),
  ) as Record<C, WorstDefeat<C>>

/**
#### Wikipedia: [Minimax Condorcet method](https://en.wikipedia.org/wiki/Minimax_Condorcet_method)
*/
export class Minimax<C extends string> extends MatrixScoreMethod<C> {
  public static readonly label: string = 'Minimax'

  public readonly minimaxVariant: MinimaxVariant
  public readonly excludeTies: boolean

  constructor(
    i: (Matrix<C> | Profile<C>) & {
      variant?: MinimaxVariant | undefined
      excludeTies?: boolean | undefined
    },
  ) {
    super(i)
    this.minimaxVariant = i.variant ?? MinimaxVariant.Margins
    this.excludeTies = i.excludeTies ?? false
  }

  public scores(): ScoreObject<C> {
    return Object.fromEntries(
      Object.entries<WorstDefeat<C>>(this.worstDefeats()).map(([c, w]) => [
        c,
        -w.defeat,
      ]),
    ) as ScoreObject<C>
  }

  /**
  Each candidate's worst defeat and who inflicts it: Minimax scores it,
  negated.
  */
  public worstDefeats(): Record<C, WorstDefeat<C>> {
    return computeWorstDefeats(
      this.matrix,
      this.minimaxVariant,
      this.excludeTies,
    )
  }
}
