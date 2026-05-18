import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots, scoresZero } from '../../utils'

const computeScores = <C extends string>(
  candidates: C[],
  _ballots: Ballot<C>[],
): ScoreObject<C> => {
  const scores = scoresZero(candidates)
  for (const ballot of normalizeBallots(_ballots, candidates)) {
    let voteValue = candidates.length // - 1
    for (const candidatesAtRank of ballot.ranking) {
      const value = voteValue - (candidatesAtRank.length - 1) / 2
      for (const candidate of candidatesAtRank)
        scores[candidate] = scores[candidate] + value * ballot.weight

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
export class Borda<C extends string> extends BallotScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return computeScores(this.candidates, this.ballots)
  }
}
