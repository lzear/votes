import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { ScoreObject } from '../../types'
import { scoresToRanking, totalBallotsWeight } from '../../utils'
import { FirstPastThePost } from '../first-past-the-post'

/**
 * #### Wikipedia: [Majority](https://en.wikipedia.org/wiki/Majority)
 */
export class AbsoluteMajority<C extends string> extends BallotScoreMethod<C> {
  private _fptp?: FirstPastThePost<C>
  private get fptp(): FirstPastThePost<C> {
    this._fptp ??= new FirstPastThePost({
      ballots: this.ballots,
      candidates: this.candidates,
    })
    return this._fptp
  }

  public scores(): ScoreObject<C> {
    return this.fptp.scores()
  }

  public ranking(): C[][] {
    const totalWeight = totalBallotsWeight(this.ballots)
    const fptpScores = this.fptp.scores()
    const topRank = scoresToRanking(fptpScores)[0] ?? []
    const top0 = topRank[0]
    const top0Score = top0 === undefined ? undefined : fptpScores[top0]

    return top0 !== undefined &&
      top0Score !== undefined &&
      topRank.length === 1 &&
      top0Score > totalWeight / 2
      ? [[top0], this.candidates.filter((c: C) => c !== top0)]
      : [this.candidates]
  }
}
