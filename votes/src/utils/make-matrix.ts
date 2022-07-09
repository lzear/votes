import difference from 'lodash/difference'
import range from 'lodash/range'
import times from 'lodash/times'
import type { Ballot, Matrix } from '../types'

export const matrixFromBallots = (
  ballots: Ballot[],
  candidates: string[],
): Matrix => {
  const array: number[][] = times(candidates.length, () =>
    times(candidates.length, () => 0),
  )
  for (const ranking of ballots) {
    const rIndex = ranking.ranking.map((rank) =>
      rank.map((c) => candidates.indexOf(c)),
    )
    let rankedLower = range(candidates.length)
    for (const rank of rIndex) {
      rankedLower = difference(rankedLower, rank)
      for (const w of rank)
        for (const l of rankedLower) {
          array[w][l] += ranking.weight
        }
    }
  }
  return { array, candidates }
}

export const makeAntisymetric = (matrix: Matrix): Matrix => ({
  array: matrix.array.map((values, row) =>
    values.map((v, col) => v - matrix.array[col][row]),
  ),
  candidates: matrix.candidates,
})

export const subMatrix = (
  matrix: Matrix,
  selectedCandidates: string[],
): Matrix => {
  const selectedIdxs = new Set(
    selectedCandidates.map((selectedCandidate) => {
      const idx = matrix.candidates.indexOf(selectedCandidate)
      if (idx === -1)
        throw new Error(
          `Selected candidates should be in the matrix. "${selectedCandidates}" is missing.`,
        )
      return idx
    }),
  )

  return {
    array: matrix.array
      .filter((row, rowIdx) => selectedIdxs.has(rowIdx))
      .map((row) => row.filter((col, colIdx) => selectedIdxs.has(colIdx))),
    candidates: matrix.candidates.filter((c) => selectedCandidates.includes(c)),
  }
}
