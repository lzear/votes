import { Ballot, ScoreObject } from '../../types'
import { scoresZero } from '../../utils/scores-zero'
import { normalizeBallots } from '../../utils'
import { BallotScoreMethod } from '../../classes/ballot-score-method'

const computeScores = (
  candidates: string[],
  _ballots: Ballot[],
): ScoreObject => {
  const scores = scoresZero(candidates)
  const ballots = normalizeBallots(_ballots, candidates)
  for (const ballot of normalizeBallots(ballots, candidates)) {
    let voteValue = candidates.length - 1
    for (const candidatesAtRank of ballot.ranking) {
      const value = voteValue - (candidatesAtRank.length - 1) / 2
      for (const candidate of candidatesAtRank) {
        scores[candidate] += value * ballot.weight
      }
      voteValue -= candidatesAtRank.length
    }
  }
  return scores
}

export class Borda extends BallotScoreMethod {
  public scores(): ScoreObject {
    return computeScores(this.candidates, this.ballots)
  }
}
