import type { Ballot, ScoreObject } from '../../types'
import { FirstPastThePost } from '../first-past-the-post'
import { normalizeBallots } from '../../utils'
import { RoundBallotMethod } from '../../classes/round-ballot-method'

const round = (
  candidates: string[],
  ballots: Ballot[],
): {
  qualified: string[]
  eliminated: string[]
  scores: ScoreObject
} => {
  const normalizedBallots = normalizeBallots(ballots, candidates)

  const fptp = new FirstPastThePost({
    ballots: normalizedBallots,
    candidates,
  })
  const round1 = fptp.scores()
  const minScore = Math.min(...Object.values(round1))
  const qualified = candidates.filter((c) => round1[c] > minScore)
  const eliminated = candidates.filter((c) => round1[c] <= minScore)
  return {
    eliminated,
    qualified,
    scores: round1,
  }
}

/**
 * #### Wikipedia: [Instant-runoff voting](https://en.wikipedia.org/wiki/Instant-runoff_voting)
 */
export class InstantRunoff extends RoundBallotMethod {
  protected round(candidates: string[]): {
    qualified: string[]
    eliminated: string[]
    scores: ScoreObject
  } {
    return round(candidates, this.ballots)
  }
}
