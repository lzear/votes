/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Matrix } from '../../types'
import { findSmithSet } from '../../utils'
import { InstantRunoffHybrid } from '../instant-runoff/hybrid'
import { beatpaths } from '../schulze'

/**
Which top set `TidemanAlternative` narrows the race to: the Smith set, whose
members beat or tie everyone outside it, or the Schwartz set, the
candidates no one outside their beatpath cycle beats.
*/
export type TopSet = 'smith' | 'schwartz'

// Those every candidate beating them, directly or through others, they beat
// back the same way: a beatpath of positive strength.
const schwartzSet = <C extends string>(matrix: Matrix<C>): C[] => {
  const p = beatpaths(matrix, 'winning-votes')
  return matrix.candidates.filter((_, x) =>
    matrix.candidates.every((_, y) => p[y]![x]! <= 0 || p[x]![y]! > 0),
  )
}

/**
Each round keeps the top set of the candidates left, and when it holds them
all, puts out the one with the fewest first choices.

#### Wikipedia: [Tideman alternative method](https://en.wikipedia.org/wiki/Tideman_alternative_method)
*/
export class TidemanAlternative<
  C extends string,
> extends InstantRunoffHybrid<C> {
  public static readonly label = 'TidemanAlternative'

  public readonly topSet: TopSet

  constructor(
    input: ConstructorParameters<typeof InstantRunoffHybrid<C>>[0] & {
      topSet?: TopSet
    },
  ) {
    super(input)
    this.topSet = input.topSet ?? 'smith'
  }

  protected kept(race: C[]): C[] {
    const duels = this.duels(race)
    return this.topSet === 'schwartz'
      ? schwartzSet(duels)
      : [...findSmithSet(duels).candidates]
  }
}
