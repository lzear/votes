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

// eslint-disable-next-line sonarjs/cognitive-complexity
const floydWarshall = (p: number[][], n: number): void => {
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      // eslint-disable-next-line unicorn/no-break-in-nested-loop
      if (i === j) continue
      else
        for (let k = 0; k < n; k++)
          if (i !== k && j !== k)
            p[j]![k] = Math.max(p[j]![k]!, Math.min(p[j]![i]!, p[i]![k]!))
}

const scoresFromStrengths = <C extends string>(
  candidates: C[],
  p: number[][],
): ScoreObject<C> => {
  const s = {} as ScoreObject<C>
  for (const [k, c] of candidates.entries())
    s[c] = p[k]!.filter((v, k2) => v > p[k2]![k]!).length
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
