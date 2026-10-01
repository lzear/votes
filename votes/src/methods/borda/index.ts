import { BallotScoreMethod } from '../../classes/ballot-score-method'
import { type Ballot, type ScoreObject } from '../../types'
import { scoresZero } from '../../utils'

// Skips candidates out of `candidates`, so ballots normalized against a
// superset of them work as they are.
export const bordaScores = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): ScoreObject<C> => {
  const scores = scoresZero(candidates)
  const running = new Set(candidates)
  for (const ballot of ballots) {
    let voteValue = candidates.length
    for (const rank of ballot.ranking) {
      const candidatesAtRank = rank.filter((c) => running.has(c))
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
    return bordaScores(this.ballots, this.candidates)
  }
}
