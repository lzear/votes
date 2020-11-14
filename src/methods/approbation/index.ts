import * as _ from 'lodash'
import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'

export const approbation: SystemUsingRankings = {
  type: VotingSystem.Approbation,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const result: ScoreObject = _.zipObject(
      candidates,
      new Array(candidates.length).fill(0),
    )
    ballots.forEach((ballot) => {
      if (ballot.ranking.length) {
        const votes = ballot.ranking[0].filter((c) => candidates.includes(c))
        votes.forEach((v) => {
          result[v] += ballot.weight
        })
      }
    })
    return result
  },
}
