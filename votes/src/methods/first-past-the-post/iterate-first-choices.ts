import type { Ballot, ScoreObject } from '../../types'
import { scoresZero } from '../../utils'

// Callers (BallotMethod subclasses) pass already-normalized ballots.
export const iterateFirstChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  computeBallotScore: (rank: string[]) => number,
): ScoreObject<C> => {
  const result = scoresZero(candidates)
  for (const ballot of ballots) {
    const votes = ballot.ranking[0] ?? []
    for (const candidate of votes)
      result[candidate] += computeBallotScore(votes) * ballot.weight
  }
  return result
}
