import sum from 'lodash/sum'
import difference from 'lodash/difference'
import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'
import { borda } from '../borda'

export const nanson: SystemUsingRankings = {
  type: VotingSystem.NANSON,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const score: ScoreObject = {}
    let remainingCandidates = candidates
    let points = 0
    while (remainingCandidates.length > 0) {
      const bordaScores = borda.computeFromBallots(ballots, remainingCandidates)
      const scores = Object.values(bordaScores)
      const avg = sum(scores) / scores.length
      const losers = remainingCandidates.filter((c) => bordaScores[c] <= avg)
      let maxPoints = points + 1
      for (const loser of losers) {
        const p = points + bordaScores[loser] + 1
        score[loser] = p
        if (p > maxPoints) maxPoints = p
      }
      remainingCandidates = difference(remainingCandidates, losers)
      points = maxPoints
    }
    return score
  },
}
