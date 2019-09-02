import * as _ from 'lodash'
import { Bulletin, WeightedRanking } from '../types'

export const matrixFromWeighted = (rankings: WeightedRanking[], candidates: string[]) => {
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

const bulletinEq = (a: Bulletin, b: Bulletin) =>
  _.every(a, (rank, k) => _.isEqual(rank.sort(), b[k].sort()))

const bulletins2weighted = (bulletins: Bulletin[]) => {
  const weighted: WeightedRanking[] = []
  return bulletins.reduce((w, bulletin) => {
    const match = w.findIndex(ww => {
      bulletinEq(ww.ranking, bulletin)
    })
    if (match === -1) {
      return [...w, { ranking: bulletin, weight: 1 }]
    }
    return w.map((ww, k) => {
      if (k !== match) return ww
      return {
        ranking: w[match].ranking,
        weight: w[match].weight + 1
      }
    })
  }, weighted)
}

export const matrixFromBulletins = (bulletins: Bulletin[], candidtes: string[]) => {
  return matrixFromWeighted(bulletins2weighted(bulletins), candidtes)
}
