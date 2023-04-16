import _ from 'lodash'

import { RoundBallotMethod } from '../../classes/round-ballot-method'
import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots } from '../../utils'
import { scoresZero } from '../../utils/scores-zero'
import { AbsoluteMajority } from '../absolute-majority'
import { FirstPastThePost } from '../first-past-the-post'

const reverseBallots = (ballots: Ballot[]) =>
  ballots.map((ballot) => ({
    ...ballot,
    ranking: [...ballot.ranking].reverse(),
  }))

const round = (
  candidates: string[],
  _ballots: Ballot[],
): {
  qualified: string[]
  eliminated: string[]
  scores: ScoreObject
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
      eliminated: _.difference(candidates, qualified),
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
    qualified: _.difference(candidates, eliminated),
    scores: _.mapValues(reversedFptp.scores(), (s) => -s),
  }
}

/**
 * #### Wikipedia: [Coombs' method](https://en.wikipedia.org/wiki/Coombs%27_method)
 */
export class Coombs extends RoundBallotMethod {
  protected round(candidates: string[]): {
    eliminated: string[]
    qualified: string[]
    scores: ScoreObject
  } {
    return round(candidates, this.ballots)
  }
}
