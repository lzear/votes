import _ from 'lodash'

import { Bulletin, MethodFromRankings, ScoreObject, PollType } from '../../types'
import majority from '../majority'

const runoff: MethodFromRankings = {
  type: PollType.Runoff,
  computeScoresFromRankings(candidates: string[], bulletins: Bulletin[]): ScoreObject {
    const round1 = majority.computeScoresFromRankings(candidates, bulletins)
    if (candidates.length < 3) return round1
    const scores = Object.values(round1).sort((a, b) => a - b)
    const candidates2 = candidates.filter(c => round1[c] >= scores[1])
    const bulletins2 = bulletins.map(bulletin =>
      bulletin.map(r => r.filter(c => candidates2.includes(c)))
    )
    const round2 = majority.computeScoresFromRankings(candidates2, bulletins2)
    return {
      ...round1,
      ..._.mapValues(round2, score => score + scores[0])
    }
  }
}

export default runoff
