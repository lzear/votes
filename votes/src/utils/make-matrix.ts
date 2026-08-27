/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { range, times } from 'lodash-es'
import { type Ballot, type Matrix } from '../types'

// n×n matrix where off-diagonal cells are `value(i, j)` and the diagonal is 0.
export const pairwiseMatrix = (
  n: number,
  value: (i: number, j: number) => number,
): number[][] => {
  const array: number[][] = times(n, () => times(n, () => 0))
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) if (i !== j) array[i]![j] = value(i, j)
  return array
}

export const matrixFromBallots = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): Matrix<C> => {
  const array: number[][] = times(candidates.length, () =>
    times(candidates.length, () => 0),
  )
  const candidateIdx = new Map(candidates.map((c, i) => [c, i]))
  for (const ranking of ballots) {
    const rIndex = ranking.ranking.map((rank) =>
      rank
        .map((c) => candidateIdx.get(c))
        .filter((i): i is number => i !== undefined),
    )
    const rankedLower = new Set(range(candidates.length))
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
