import type { Ballot, ScoreObject } from '../../types'
import { scoresZero } from '../../utils'

// Callers (BallotMethod subclasses) pass already-normalized ballots.
export const iterateFirstChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  computeBallotScore: (rank: string[], rankIdx: number) => number,
): ScoreObject<C> => {
  const result = scoresZero(candidates)
  for (const ballot of ballots)
    if (ballot.ranking.length > 0) {
      const votes = ballot.ranking.at(0) ?? []
      for (const candidate of votes)
        result[candidate] += computeBallotScore(votes, 0) * ballot.weight
    }
  return result
}
