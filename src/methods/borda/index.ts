import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'
import { scoresZero } from '../../utils/scoresZero'

export const borda: SystemUsingRankings = {
  type: VotingSystem.Borda,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const result: ScoreObject = scoresZero(candidates)
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
