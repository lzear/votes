/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { type Ballot, type Matrix, type Profile } from '../types'
import { config } from './config'
import { weightOf } from './normalize'

const zeros = (n: number): number[][] =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => 0))

// n×n matrix where off-diagonal cells are `value(i, j)` and the diagonal is 0.
export const pairwiseMatrix = (
  n: number,
  value: (i: number, j: number) => number,
): number[][] => {
  const array = zeros(n)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) if (i !== j) array[i]![j] = value(i, j)
  return array
}

/**
 * Pairwise matrix: `array[i][j]` is the weight of ballots ranking candidate
 * `i` above candidate `j`, rounded to the 1e-6 tie tolerance so that
 * fractional weights tie as they should (0.4 + 0.2 floats above 0.6).
 *
 * @param unrankedLast - whether a ballot ranks the candidates it leaves out
 * below the others (default true). Pass false to count only what it ranks.
 */
export const matrixFromBallots = <C extends string>(
  ballots: Ballot<C>[],
  _candidates: C[],
  unrankedLast = true,
): Matrix<C> => {
  // Once each: a repeat would add a row that no ballot counts.
  const candidates = [...new Set(_candidates)]
  const array = zeros(candidates.length)
  const candidateIdx = new Map(candidates.map((c, i) => [c, i]))
  for (const ranking of ballots) {
    const rIndex = ranking.ranking.map((rank) =>
      rank
        .map((c) => candidateIdx.get(c))
        .filter((i): i is number => i !== undefined),
    )
    const weight = weightOf(ranking)
    const rankedLower = new Set(
      unrankedLast ? candidates.keys() : rIndex.flat(),
    )
    for (const rank of rIndex) {
      // A candidate listed twice counts at its first rank only.
      const winners = rank.filter((i) => rankedLower.delete(i))
      for (const w of winners)
        for (const l of rankedLower) array[w]![l]! += weight
    }
  }
  const scale = 1 / config.EPSILON
  return {
    array: array.map((row) => row.map((v) => Math.round(v * scale) / scale)),
    candidates,
  }
}

// The matrix `input` is, or the one its ballots make.
export const toMatrix = <C extends string>(
  input: Matrix<C> | Profile<C>,
): Matrix<C> =>
  'array' in input
    ? { array: input.array, candidates: input.candidates }
    : matrixFromBallots(input.ballots, input.candidates, input.unrankedLast)

export const makeAntisymmetric = <C extends string>(
  matrix: Matrix<C>,
): Matrix<C> => ({
  array: matrix.array.map((values, row) =>
    values.map((v, col) => v - matrix.array[col]![row]!),
  ),
  candidates: matrix.candidates,
})

// The matrix of `selected` alone, in their order.
export const subMatrix = <C extends string, S extends C>(
  matrix: Matrix<C>,
  selected: S[],
): Matrix<S> => {
  const candidates = [...new Set(selected)]
  const idx = candidates.map((c) => {
    const i = matrix.candidates.indexOf(c)
    if (i === -1)
      throw new Error(
        `Selected candidates should be in the matrix. "${c}" is missing.`,
      )
    return i
  })
  return {
    array: idx.map((i) => idx.map((j) => matrix.array[i]![j]!)),
    candidates,
  }
}
