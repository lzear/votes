import * as _ from 'lodash'
import { Matrix, Ballot } from '../types'

export const matrixFromBallots = (ballots: Ballot[], candidates: string[]): Matrix => {
  const array: number[][] = _.times(candidates.length, () => _.times(candidates.length, () => 0))
  ballots.forEach((ranking) => {
    const rIndex = ranking.ranking.map((rank) => rank.map((c) => candidates.indexOf(c)))
    let rankedLower = _.range(candidates.length)
    rIndex.forEach((rank) => {
      rankedLower = _.difference(rankedLower, rank)
      rank.forEach((w) =>
        rankedLower.forEach((l) => {
          array[w][l] += ranking.weight
        })
      )
    })
  })
  return { array, candidates }
}
