import * as _ from 'lodash'

import { Ballot, SystemUsingRankings, ScoreObject, VotingSystem } from '../../types'
import majority from '../majority'

const runoff: SystemUsingRankings = {
  type: VotingSystem.Runoff,
  computeScoresFromRankings(candidates: string[], ballots: Ballot[]): ScoreObject {
    const round1 = majority.computeScoresFromRankings(candidates, ballots)
    if (candidates.length < 3) return round1
    const scores = Object.values(round1).sort((a, b) => a - b)
    const candidates2 = candidates.filter(c => round1[c] >= scores[1])
    const ballots2 = ballots.map(ballot => ballot.map(r => r.filter(c => candidates2.includes(c))))
    const round2 = majority.computeScoresFromRankings(candidates2, ballots2)
    return {
      ...round1,
      ..._.mapValues(round2, score => score + scores[0])
    }
  }
}

export default runoff
