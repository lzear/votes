import type { Ballot, ScoreObject } from '../../types'
import { FirstPastThePost } from '../first-past-the-post'
import { normalizeBallots } from '../../utils'
import _ from 'lodash'
import { RoundBallotMethod } from '../../classes/round-ballot-method'
import { AbsoluteMajority } from '../absolute-majority'
import { scoresZero } from '../../utils/scores-zero'

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

export class Coombs extends RoundBallotMethod {
  protected round(candidates: string[]): {
    eliminated: string[]
    qualified: string[]
    scores: ScoreObject
  } {
    return round(candidates, this.ballots)
  }
}
