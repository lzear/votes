import { BallotScoreMethod } from '../../classes/ballot-score-method'
import { type Ballot, type ScoreObject } from '../../types'
import { scoresZero } from '../../utils'

// Ballots arrive already normalized by the BallotMethod constructor.
const computeScores = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
): ScoreObject<C> => {
  const scores = scoresZero(candidates)
  for (const ballot of ballots) {
    let voteValue = candidates.length
    for (const candidatesAtRank of ballot.ranking) {
      const value = voteValue - (candidatesAtRank.length - 1) / 2
      for (const candidate of candidatesAtRank)
        scores[candidate] += value * ballot.weight

      voteValue -= candidatesAtRank.length
    }
  }
  return scores
}

/**
 * Each voter gives n points to their first choice, n − 1 to the next, down to 1 for the last. Tied candidates share the average of the places they cover.
 *
 * #### Wikipedia: [Borda count](https://en.wikipedia.org/wiki/Borda_count)
 */
export class Borda<C extends string> extends BallotScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return computeScores(this.candidates, this.ballots)
  }
}
