import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { ScoreObject } from '../../types'
import { iterateFirstChoices } from '../first-past-the-post/iterate-first-choices'

/**
 * #### Wikipedia: [Approval voting](https://en.wikipedia.org/wiki/Approval_voting)
 */
export class Approbation<C extends string> extends BallotScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return iterateFirstChoices(this.ballots, this.candidates, () => 1)
  }
}
