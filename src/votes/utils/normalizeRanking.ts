import _ from 'lodash'
import { WeightedRanking } from '../types'

export const scores2ranking = (scores: { score: number; name: string }[]) =>
  _.sortBy(_.values(_.groupBy(scores, 'score')), r => -r[0].score).map(r => r.map(rr => rr.name))

export const cleanBulletins = (bulletins: WeightedRanking[], candidates: string[]) =>
  bulletins.map(bulletin => ({
    weight: bulletin.weight,
    ranking: bulletin.ranking
      .map(rank => _.union(rank, candidates).filter(r => r.length))
      .filter(ranking => ranking.length)
  }))
