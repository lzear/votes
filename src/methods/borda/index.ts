import * as _ from 'lodash'
import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'

const borda: SystemUsingRankings = {
  type: VotingSystem.Borda,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const result: ScoreObject = _.zipObject(
      candidates,
      new Array(candidates.length).fill(0),
    )
    ballots.forEach((ballot) => {
      let voteValue = candidates.length - 1
      ballot.ranking.forEach((candidatesAtRank) => {
        const value = voteValue - (candidatesAtRank.length - 1) / 2
        candidatesAtRank.forEach((candidate) => {
          result[candidate] += value * ballot.weight
        })
        voteValue -= candidatesAtRank.length
      })
    })
    return result
  },
}

export default borda
