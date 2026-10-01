import { type Ballot, type ScoreObject } from '../../types'
import { scoresZero } from '../../utils'

// A ballot votes for its first tier with any of `candidates`, so ballots
// normalized against a superset of them work as they are.
export const iterateFirstChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  computeBallotScore: (rank: string[]) => number,
): ScoreObject<C> => {
  const result = scoresZero(candidates)
  const running = new Set(candidates)
  for (const ballot of ballots) {
    const votes =
      ballot.ranking
        .values()
        .map((rank) => rank.filter((c) => running.has(c)))
        .find((rank) => rank.length > 0) ?? []
    for (const candidate of votes)
      result[candidate] += computeBallotScore(votes) * ballot.weight
  }
  return result
}

export const firstChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): ScoreObject<C> =>
  iterateFirstChoices(ballots, candidates, (rank) => 1 / rank.length)
