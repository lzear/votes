import * as _ from 'lodash'

import { SystemUsingRankings, ScoreObject, VotingSystem, Ballot } from '../../types'

const firstPastThePost: SystemUsingRankings = {
  type: VotingSystem.FirstPastThePost,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const result: ScoreObject = _.zipObject(candidates, new Array(candidates.length).fill(0))
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

export default firstPastThePost