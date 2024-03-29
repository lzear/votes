import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots } from '../../utils/normalize'
import { scoresZero } from '../../utils/scores-zero'

const computeScores = (
  candidates: string[],
  _ballots: Ballot[],
): ScoreObject => {
  const scores = scoresZero(candidates)
  const ballots = normalizeBallots(_ballots, candidates)
  for (const ballot of normalizeBallots(ballots, candidates)) {
    let voteValue = candidates.length // - 1
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

/**
 * For each voter, every candidate is given a number of points which equals the number of candidates ranked lower in the voter's preference.
 *
 * #### Wikipedia: [Borda count](https://en.wikipedia.org/wiki/Borda_count)
 */
export class Borda extends BallotScoreMethod {
  public scores(): ScoreObject {
    return computeScores(this.candidates, this.ballots)
  }
}
