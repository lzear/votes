import * as _ from 'lodash'
import { Ballot, SystemUsingRankings, ScoreObject, VotingSystem } from '../../types'

const borda: SystemUsingRankings = {
  type: VotingSystem.Borda,
  computeScoresFromRankings(candidates: string[], ballots: Ballot[]): ScoreObject {
    const result: ScoreObject = _.zipObject(candidates, new Array(candidates.length).fill(0))
    ballots.forEach(ballot => {
      let voteValue = candidates.length - 1
      ballot.forEach(candidatesAtRank => {
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
