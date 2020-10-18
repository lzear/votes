import { SystemUsingRankings, ScoreObject, VotingSystem, Ballot } from '../../types'
import firstPastThePost from '../first-past-the-post'
import { normalizeBallots } from '../../utils'

const irunoff: SystemUsingRankings = {
  type: VotingSystem.InstantRunoff,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    const round1: ScoreObject = firstPastThePost.computeFromBallots(ballots, candidates)
    if (candidates.length <= 2) return round1
    const minScore = Math.min(...Object.values(round1))
    const candidates2 = candidates.filter((c) => round1[c] > minScore)
    return {
      ...round1,
      ...irunoff.computeFromBallots(normalizeBallots(ballots, candidates2), candidates2),
    }
  },
}

export default irunoff
