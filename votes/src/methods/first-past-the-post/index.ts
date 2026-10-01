import { BallotScoreMethod } from '../../classes/ballot-score-method'
import { type ScoreObject } from '../../types'
import { firstChoices } from './iterate-first-choices'

/**
 * #### Wikipedia: [First-past-the-post voting](https://en.wikipedia.org/wiki/First-past-the-post_voting)
 */
export class FirstPastThePost<C extends string> extends BallotScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return firstChoices(this.ballots, this.candidates)
  }
}
