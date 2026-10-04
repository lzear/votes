import { BallotScoreMethod } from '../../classes/ballot-score-method'
import { type Ballot, type Matrix, type ScoreObject } from '../../types'
import { nonBlank, scoresZero, totalBallotsWeight, weightOf } from '../../utils'
import { makeAntisymmetric, subMatrix } from '../../utils/make-matrix'
import { sum } from '../../utils/sum'

// Skips candidates out of `candidates`, so ballots normalized against a
// superset of them work as they are.
export const bordaScores = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): ScoreObject<C> => {
  const scores = scoresZero(candidates)
  const running = new Set(candidates)
  for (const ballot of ballots) {
    const weight = weightOf(ballot)
    let voteValue = candidates.length
    for (const rank of ballot.ranking) {
      const candidatesAtRank = rank.filter((c) => running.has(c))
      const value = voteValue - (candidatesAtRank.length - 1) / 2
      for (const candidate of candidatesAtRank)
        scores[candidate] += value * weight

      voteValue -= candidatesAtRank.length
    }
  }
  return scores
}

/**
 * Borda scores from the pairwise matrix: half of each candidate's margins
 * over the others, plus (n + 1) / 2 per ballot ranking any of them. The same
 * as {@link bordaScores} when ballots rank everyone, and a Condorcet winner
 * always scores highest even when they don't.
 */
export const matrixBordaScores = <C extends string>(
  matrix: Matrix<C>,
  ballots: Ballot<C>[],
  candidates: C[],
): ScoreObject<C> => {
  const voters = totalBallotsWeight(nonBlank(ballots, candidates))
  const { array } = makeAntisymmetric(subMatrix(matrix, candidates))
  return Object.fromEntries(
    candidates.map((c, i) => [
      c,
      (voters * (candidates.length + 1) + sum(array[i] ?? [])) / 2,
    ]),
  ) as ScoreObject<C>
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
