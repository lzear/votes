import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { ScoreObject } from '../../types'
import { totalBallotsWeight } from '../../utils'
import { FirstPastThePost } from '../first-past-the-post'

/**
 * #### Wikipedia: [Majority](https://en.wikipedia.org/wiki/Majority)
 */
export class AbsoluteMajority<C extends string> extends BallotScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return new FirstPastThePost({
      ballots: this.ballots,
      candidates: this.candidates,
    }).scores()
  }

  public ranking(): C[][] {
    const totalWeight = totalBallotsWeight(this.ballots)
    const fptp = new FirstPastThePost({
      ballots: this.ballots,
      candidates: this.candidates,
    })
    const topRank = fptp.ranking()[0]
    const fptpScores = fptp.scores()
    const top0 = topRank?.[0]
    const top0Score = top0 === undefined ? undefined : fptpScores[top0]

    return top0 !== undefined &&
      top0Score !== undefined &&
      topRank?.length === 1 &&
      top0Score > totalWeight / 2
      ? [[top0], this.candidates.filter((c: C) => c !== top0)]
      : [this.candidates]
  }
}
