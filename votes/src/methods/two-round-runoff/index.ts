import _ from 'lodash'
import type { ScoreObject } from '../../types'
import { FirstPastThePost } from '../first-past-the-post'
import { RoundBallotMethod } from '../../classes/round-ballot-method'
import { AbsoluteMajority } from '../absolute-majority'

export class TwoRoundRunoff extends RoundBallotMethod {
  protected round(
    candidates: string[],
    idx: number,
  ): {
    eliminated: string[]
    qualified: string[]
    scores: ScoreObject
  } {
    const scores: ScoreObject = new FirstPastThePost({
      ballots: this.ballots,
      candidates,
    }).scores()

    const absoluteMajority = new AbsoluteMajority({
      ballots: this.ballots,
      candidates,
    })
    if (absoluteMajority.ranking().length > 1) {
      const qualified = absoluteMajority.ranking()[0]
      if (!qualified)
        throw new Error('Unexpected error in absolute majority computation')

      return {
        eliminated: _.difference(candidates, qualified),
        qualified,
        scores,
      }
    }
    const scoreValues = Object.values(scores).sort((a, b) => b - a)

    if (idx === 0) {
      const qualified = candidates.filter((c) => scores[c] >= scoreValues[1])
      return {
        eliminated: _.difference(candidates, qualified),
        qualified,
        scores,
      }
    }
    if (idx === 1) {
      const qualified = candidates.filter((c) => scores[c] >= scoreValues[0])
      return {
        eliminated: _.difference(candidates, qualified),
        qualified,
        scores,
      }
    }
    return {
      eliminated: candidates,
      qualified: [],
      scores,
    }
  }
}
