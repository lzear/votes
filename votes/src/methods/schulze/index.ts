/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, Profile, ScoreObject } from '../../types'
import { pairwiseMatrix } from '../../utils/make-matrix'
import { type Strength, winStrength } from '../../utils/strength'

const initStrengths = <C extends string>(
  n: number,
  { array }: Matrix<C>,
  strength: Strength,
): number[][] =>
  pairwiseMatrix(n, (i, j) =>
    array[i]![j]! > array[j]![i]!
      ? winStrength(strength, array[i]![j]!, array[j]![i]!)
      : 0,
  )

// widens every path j → k that is stronger through candidate i
const relaxThrough = (p: number[][], n: number, i: number): void => {
  for (let j = 0; j < n; j++)
    if (j !== i)
      for (let k = 0; k < n; k++)
        if (k !== i && k !== j)
          p[j]![k] = Math.max(p[j]![k]!, Math.min(p[j]![i]!, p[i]![k]!))
}

const floydWarshall = (p: number[][], n: number): void => {
  for (let i = 0; i < n; i++) relaxThrough(p, n, i)
}

// Ranks in layers: the candidates no one beats on beatpaths, then those no one
// left beats, and so on. Counting wins instead would split candidates neither
// of whom beats the other. A candidate scores the number ranked below it,
// which is its win count when there are no ties.
const scoresFromStrengths = <C extends string>(
  candidates: readonly C[],
  p: number[][],
): ScoreObject<C> => {
  const s = new Map<C, number>()
  let left = candidates.keys().toArray()
  while (left.length > 0) {
    const unbeaten = left.filter((i) =>
      left.every((j) => p[j]![i]! <= p[i]![j]!),
    )
    left = left.filter((i) => !unbeaten.includes(i))
    for (const i of unbeaten) s.set(candidates[i]!, left.length)
  }
  return Object.fromEntries(s) as ScoreObject<C>
}

/**
`strength` measures a direct win by the winner's votes (`'winning-votes'`, the
default) or by its margin (`'margins'`): they differ when voters tie or leave
out both candidates.

#### Wikipedia: [Schulze method](https://en.wikipedia.org/wiki/Schulze_method)
*/
export class Schulze<C extends string> extends MatrixScoreMethod<C> {
  public static readonly label = 'Schulze'

  public readonly strength: Strength

  constructor(i: (Matrix<C> | Profile<C>) & { strength?: Strength }) {
    super(i)
    this.strength = i.strength ?? 'winning-votes'
  }

  /**
  Strongest-path ("beatpath") strength between every ordered pair of
  candidates, after Floyd-Warshall — the matrix Schulze's win count is
  derived from.
  */
  public strengths(): Matrix<C> {
    const { candidates } = this.matrix
    const p = initStrengths(candidates.length, this.matrix, this.strength)
    floydWarshall(p, candidates.length)
    return { candidates, array: p }
  }

  public scores(): ScoreObject<C> {
    const { candidates, array } = this.strengths()
    return scoresFromStrengths(candidates, array)
  }
}
