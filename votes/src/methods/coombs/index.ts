import { difference, mapValues } from 'lodash-es'
import { RoundBallotMethod } from '../../classes/round-ballot-method'
import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots } from '../../utils'
import { scoresZero } from '../../utils/scores-zero'
import { AbsoluteMajority } from '../absolute-majority'
import { FirstPastThePost } from '../first-past-the-post'

const reverseBallots = <C extends string>(ballots: Ballot<C>[]) =>
  ballots.map((ballot) => ({
    ...ballot,
    ranking: ballot.ranking.toReversed(),
  }))

const round = <C extends string>(
  candidates: C[],
  _ballots: Ballot<C>[],
): {
  qualified: C[]
  eliminated: C[]
  scores: ScoreObject<C>
  absoluteMajority?: true
} => {
  if (candidates.length < 2)
    return {
      eliminated: candidates,
      qualified: [],
      scores: scoresZero(candidates),
    }

  const ballots = normalizeBallots(_ballots, candidates)

  const absoluteMajority = new AbsoluteMajority({ candidates, ballots })

  if (absoluteMajority.ranking()[0].length === 1) {
    const qualified = absoluteMajority.ranking()[0]
    return {
      eliminated: difference(candidates, qualified),
      qualified,
      scores: absoluteMajority.scores(),
      absoluteMajority: true,
    }
  }

  const reversedFptp = new FirstPastThePost({
    ballots: reverseBallots(ballots),
    candidates,
  })
  const eliminated = reversedFptp.ranking()[0]
  return {
    eliminated,
    qualified: difference(candidates, eliminated),
    scores: mapValues(reversedFptp.scores(), (s) => -s),
  }
}

/**
 * #### Wikipedia: [Coombs' method](https://en.wikipedia.org/wiki/Coombs%27_method)
 */
export class Coombs<C extends string> extends RoundBallotMethod<C> {
  protected round(candidates: C[]): {
    eliminated: C[]
    qualified: C[]
    scores: ScoreObject<C>
  } {
    return round(candidates, this.ballots)
  }
}
