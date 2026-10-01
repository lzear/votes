/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import { type Matrix, type ScoreObject } from '../../types'
import { pairwiseMatrix } from '../../utils/make-matrix'

const initStrengths = <C extends string>(
  n: number,
  matrix: Matrix<C>,
): number[][] =>
  pairwiseMatrix(n, (i, j) =>
    matrix.array[i]![j]! > matrix.array[j]![i]! ? matrix.array[i]![j]! : 0,
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
  candidates: C[],
  p: number[][],
): ScoreObject<C> => {
  const s = {} as ScoreObject<C>
  let left = candidates.keys().toArray()
  while (left.length > 0) {
    const unbeaten = left.filter((i) =>
      left.every((j) => p[j]![i]! <= p[i]![j]!),
    )
    left = left.filter((i) => !unbeaten.includes(i))
    for (const i of unbeaten) s[candidates[i]!] = left.length
  }
  return s
}

/**
 * #### Wikipedia: [Schulze method](https://en.wikipedia.org/wiki/Schulze_method)
 */
export class Schulze<C extends string> extends MatrixScoreMethod<C> {
  /**
   * Strongest-path ("beatpath") strength between every ordered pair of
   * candidates, after Floyd-Warshall — the matrix Schulze's win count is
   * derived from.
   */
  public strengths(): Matrix<C> {
    const { candidates } = this.matrix
    const p = initStrengths(candidates.length, this.matrix)
    floydWarshall(p, candidates.length)
    return { candidates, array: p }
  }

  public scores(): ScoreObject<C> {
    const { candidates, array } = this.strengths()
    return scoresFromStrengths(candidates, array)
  }
}
