import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { ScoreObject } from '../../types'
import { iterateFirstChoices } from '../first-past-the-post/iterate-first-choices'

/**
 * #### Wikipedia: [Approval voting](https://en.wikipedia.org/wiki/Approval_voting)
 */
export class Approbation extends BallotScoreMethod {
  public scores(): ScoreObject {
    return iterateFirstChoices(this.ballots, this.candidates, () => 1)
  }
}
