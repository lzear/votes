import _ from 'lodash'
import { WeightedRanking } from '../types'

export default (rankings: WeightedRanking[]) => {
  const candidates = _.flatten(rankings.map(vote => vote.ranking))
  return _.uniq(candidates)
}
