import _ from 'lodash'

import { Bulletin, MethodFromRankings, ScoreObject, PollType } from '../../types'

const majority: MethodFromRankings = {
  type: PollType.Majority,
  computeScoresFromRankings(candidateIds: string[], bulletins: Bulletin[]): ScoreObject {
    const result: ScoreObject = _.zipObject(candidateIds, new Array(candidateIds.length).fill(0))
    bulletins.forEach(bulletin => {
      if (bulletin.length) {
        const votes = bulletin[0].filter(cId => candidateIds.includes(cId))
        votes.forEach((v, k, a) => {
          result[v] += 1 / a.length
        })
      }
    })
    return result
  }
}

export default majority
