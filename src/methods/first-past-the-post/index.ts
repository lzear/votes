import zipObject from 'lodash/zipObject'

import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'

export const firstPastThePost: SystemUsingRankings = {
  type: VotingSystem.FirstPastThePost,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const result: ScoreObject = zipObject(
      candidates,
      new Array(candidates.length).fill(0),
    )
    ballots.forEach((ballot) => {
      if (ballot.ranking.length) {
        const votes = ballot.ranking[0].filter((c) => candidates.includes(c))
        votes.forEach((v, k, a) => {
          result[v] += ballot.weight / a.length
        })
      }
    })
    return result
  },
}
