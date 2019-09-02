import * as _ from 'lodash'
import { Bulletin, MethodFromRankings, ScoreObject, PollType } from '../../types'

const borda: MethodFromRankings = {
  type: PollType.Borda,
  computeScoresFromRankings(candidateIds: string[], bulletins: Bulletin[]): ScoreObject {
    const result: ScoreObject = _.zipObject(candidateIds, new Array(candidateIds.length).fill(0))
    bulletins.forEach(bulletin => {
      let voteValue = candidateIds.length - 1
      bulletin.forEach(candidatesAtRank => {
        const value = (voteValue + (voteValue - (candidatesAtRank.length - 1))) / 2
        candidatesAtRank.forEach(candidate => {
          result[candidate] += value
        })
        voteValue -= candidatesAtRank.length
      })
    })
    return result
  }
}

export default borda
