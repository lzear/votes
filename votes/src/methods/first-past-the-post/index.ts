import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { Ballot, ScoreObject } from '../../types'
import { iterateFirstChoices } from './iterate-first-choices'

const computeScores = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
) => {
  return iterateFirstChoices(ballots, candidates, (rank) => 1 / rank.length)
}

/**
 * #### Wikipedia: [First-past-the-post voting](https://en.wikipedia.org/wiki/First-past-the-post_voting)
 */
export class FirstPastThePost<C extends string> extends BallotScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return computeScores(this.candidates, this.ballots)
  }
}
