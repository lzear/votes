import difference from 'lodash/difference'
import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'
import { borda } from '../borda'
import { scoresToRanking } from '../../utils'

export const baldwin: SystemUsingRankings = {
  type: VotingSystem.Baldwin,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const score: ScoreObject = {}
    let remainingCandidates = candidates
    let points = 0
    while (remainingCandidates.length > 0) {
      const bordaScores = borda.computeFromBallots(ballots, remainingCandidates)
      const ranking = scoresToRanking(bordaScores)
      const losers = ranking[ranking.length - 1]
      for (const loser of losers) score[loser] = points
      remainingCandidates = difference(remainingCandidates, losers)
      points++
    }
    return score
  },
}
