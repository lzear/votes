import _ from 'lodash'
import { WeightedRanking } from '../types'

export default (rankings: WeightedRanking[], candidates: string[]) => {
  const m: number[][] = _.times(candidates.length, () => _.times(candidates.length, () => 0))
  rankings.forEach(ranking => {
    const rIndex = ranking.ranking.map(rank => rank.map(c => candidates.indexOf(c)))
    let rankedLower = _.range(candidates.length)
    rIndex.forEach(rank => {
      rankedLower = _.difference(rankedLower, rank)
      rank.forEach(w =>
        rankedLower.forEach(l => {
          m[w][l] = ranking.weight
        })
      )
    })
  })
  return m
}
