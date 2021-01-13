import difference from 'lodash-es/difference'
import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'
import { firstPastThePost } from '../first-past-the-post'
import { scoresToRanking } from '../../utils/scores'

export const coombs: SystemUsingRankings = {
  type: VotingSystem.Coombs,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const score: ScoreObject = {}
    const reversedBallots = ballots.map((ballot) => ({
      ranking: [...ballot.ranking].reverse(),
      weight: ballot.weight,
    }))
    let remainingCandidates = candidates
    let points = 0
    while (remainingCandidates.length > 0) {
      const fptpScore = firstPastThePost.computeFromBallots(
        reversedBallots,
        remainingCandidates,
      )
      const ranking = scoresToRanking(fptpScore)
      for (const winner of ranking[0]) score[winner] = points
      remainingCandidates = difference(remainingCandidates, ranking[0])
      points++
    }
    return score
  },
}
