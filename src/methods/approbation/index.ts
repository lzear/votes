import * as _ from 'lodash'
import { Ballot, SystemUsingRankings, ScoreObject, VotingSystem } from '../../types'

const approbation: SystemUsingRankings = {
  type: VotingSystem.Approbation,
  computeScoresFromRankings(candidates: string[], ballots: Ballot[]): ScoreObject {
    const result: ScoreObject = _.zipObject(candidates, new Array(candidates.length).fill(0))
    ballots.forEach(ballot => {
      if (ballot.length) {
        const votes = ballot[0].filter(c => candidates.includes(c))
        votes.forEach((v, k, a) => {
          result[v] += 1
        })
      }
    })
    return result
  }
}

export default approbation
