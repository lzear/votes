/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { type Ballot, type Matrix } from '../types'

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
 * `i` above candidate `j`.
 *
 * @param unrankedLast - whether a ballot ranks the candidates it leaves out
 * below the others (default true). Pass false to count only what it ranks.
 */
export const matrixFromBallots = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  unrankedLast = true,
): Matrix<C> => {
  const array = zeros(candidates.length)
  const candidateIdx = new Map(candidates.map((c, i) => [c, i]))
  for (const ranking of ballots) {
    const rIndex = ranking.ranking.map((rank) =>
      rank
        .map((c) => candidateIdx.get(c))
        .filter((i): i is number => i !== undefined),
    )
    const rankedLower = new Set(
      unrankedLast ? candidates.keys() : rIndex.flat(),
    )
    for (const rank of rIndex) {
      for (const i of rank) rankedLower.delete(i)
      for (const w of rank)
        for (const l of rankedLower) array[w]![l]! += ranking.weight
    }
  }
  return { array, candidates }
}

export const makeAntisymmetric = <C extends string>(
  matrix: Matrix<C>,
): Matrix<C> => ({
  array: matrix.array.map((values, row) =>
    values.map((v, col) => v - matrix.array[col]![row]!),
  ),
  candidates: matrix.candidates,
})

export const subMatrix = <C extends string, S extends C>(
  matrix: Matrix<C>,
  selectedCandidates: S[],
): Matrix<S> => {
  const selectedIdxs = new Set(
    selectedCandidates.map((selectedCandidate) => {
      const idx = matrix.candidates.indexOf(selectedCandidate)
      if (idx === -1)
        throw new Error(
          `Selected candidates should be in the matrix. "${selectedCandidate}" is missing.`,
        )
      return idx
    }),
  )

  return {
    array: matrix.array
      .filter((_row, rowIdx) => selectedIdxs.has(rowIdx))
      .map((row) => row.filter((_col, colIdx) => selectedIdxs.has(colIdx))),
    candidates: matrix.candidates.filter((c): c is S =>
      (selectedCandidates as C[]).includes(c),
    ),
  }
}
