import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'
import { normalizeBallots } from '../../utils'
import firstPastThePost from '../first-past-the-post'

const twoRoundRunoff: SystemUsingRankings = {
  type: VotingSystem.TwoRoundRunoff,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const round1: ScoreObject = firstPastThePost.computeFromBallots(
      ballots,
      candidates,
    )
    if (candidates.length < 3) return round1
    const scores = Object.values(round1).sort((a, b) => b - a)
    const candidates2 = candidates.filter((c) => round1[c] >= scores[1])
    const ballots2 = normalizeBallots(ballots, candidates2)
    const round2 = firstPastThePost.computeFromBallots(ballots2, candidates2)
    return {
      ...round1,
      ...round2,
    }
  },
}

export default twoRoundRunoff
