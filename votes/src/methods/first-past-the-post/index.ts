import type { Ballot, ScoreObject } from '../../types'
import { iterateFirstChoices } from './iterate-first-choices'
import { BallotScoreMethod } from '../../classes/ballot-score-method'

const computeScores = (candidates: string[], ballots: Ballot[]) => {
  return iterateFirstChoices(ballots, candidates, (rank) => 1 / rank.length)
}

export class FirstPastThePost extends BallotScoreMethod {
  public scores(): ScoreObject {
    return computeScores(this.candidates, this.ballots)
  }
}
