import { BallotScoreMethod } from '../../classes/ballot-score-method'
import { type ScoreObject } from '../../types'
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
    const fptpScores = this.fptp.scores()
    const topRank = scoresToRanking(fptpScores)[0] ?? []
    const top = topRank.length === 1 ? topRank[0] : undefined

    return top !== undefined &&
      fptpScores[top] > totalBallotsWeight(this.ballots) / 2
      ? [[top], this.candidates.filter((c) => c !== top)]
      : [this.candidates]
  }
}
