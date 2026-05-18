/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { difference, range, times } from 'lodash-es'
import type { Ballot, Matrix } from '../types'

export const matrixFromBallots = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): Matrix<C> => {
  const array: number[][] = times(candidates.length, () =>
    times(candidates.length, () => 0),
  )
  for (const ranking of ballots) {
    const rIndex = ranking.ranking.map((rank) =>
      rank.map((c) => candidates.indexOf(c)).filter((i) => i !== -1),
    )
    let rankedLower = range(candidates.length)
    for (const rank of rIndex) {
      rankedLower = difference(rankedLower, rank)
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
