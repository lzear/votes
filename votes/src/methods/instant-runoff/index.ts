import { RoundBallotMethod } from '../../classes/round-ballot-method'
import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots } from '../../utils'
import { FirstPastThePost } from '../first-past-the-post'

const round = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
): {
  qualified: C[]
  eliminated: C[]
  scores: ScoreObject<C>
} => {
  const normalizedBallots = normalizeBallots(ballots, candidates)

  const fptp = new FirstPastThePost({
    ballots: normalizedBallots,
    candidates,
  })
  const round1 = fptp.scores()
  // @ts-expect-error - this is fine, we know the candidates are the keys of round1
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
export class InstantRunoff<C extends string> extends RoundBallotMethod<C> {
  protected round(candidates: C[]): {
    qualified: C[]
    eliminated: C[]
    scores: ScoreObject<C>
  } {
    return round(candidates, this.ballots)
  }
}
