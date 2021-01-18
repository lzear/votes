import { difference, range, times } from 'lodash-es'
import { Matrix, Ballot } from '../types'

export const matrixFromBallots = (
  ballots: Ballot[],
  candidates: string[],
): Matrix => {
  const array: number[][] = times(candidates.length, () =>
    times(candidates.length, () => 0),
  )
  ballots.forEach((ranking) => {
    const rIndex = ranking.ranking.map((rank) =>
      rank.map((c) => candidates.indexOf(c)),
    )
    let rankedLower = range(candidates.length)
    rIndex.forEach((rank) => {
      rankedLower = difference(rankedLower, rank)
      rank.forEach((w) =>
        rankedLower.forEach((l) => {
          array[w][l] += ranking.weight
        }),
      )
    })
  })
  return { array, candidates }
}

export const makeAntisymetric = (matrix: Matrix): Matrix => ({
  array: matrix.array.map((values, row) =>
    values.map((v, col) => v - matrix.array[col][row]),
  ),
  candidates: matrix.candidates,
})
