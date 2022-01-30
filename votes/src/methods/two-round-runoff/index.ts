import { ScoreObject } from '../../types'
import _ from 'lodash'
import { FirstPastThePost } from '../first-past-the-post'
import { RoundBallotMethod } from '../../classes/round-ballot-method'

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
