import * as _ from 'lodash'
import { WeightedBallot } from '../types'

export default (rankings: WeightedBallot[]) => {
  const candidates = _.flatten(rankings.map(vote => vote.ranking))
  return _.uniq(candidates)
}
