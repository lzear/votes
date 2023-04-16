import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { ScoreObject } from '../../types'
import { totalBallotsWeight } from '../../utils/normalize'
import { scoresZero } from '../../utils/scores-zero'
import { FirstPastThePost } from '../first-past-the-post'

/**
 * #### Wikipedia: [Majority](https://en.wikipedia.org/wiki/Majority)
 */
export class AbsoluteMajority extends BallotScoreMethod {
  public scores(): ScoreObject {
    const totalWeight = totalBallotsWeight(this.ballots)

    const fptp = new FirstPastThePost({
      ballots: this.ballots,
      candidates: this.candidates,
    })
    const topRank = fptp.ranking()[0]
    const fptpScores = fptp.scores()

    if (topRank?.length === 1 && fptpScores[topRank[0]] > totalWeight / 2)
      return {
        ...scoresZero(this.candidates),
        [topRank[0]]: fptpScores[topRank[0]],
      }
    return scoresZero(this.candidates)
  }
}
