import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots, scoresZero } from '../../utils'

export const iterateFirstChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  computeBallotScore: (rank: string[], rankIdx: number) => number,
) => iterateNthChoices(ballots, candidates, computeBallotScore, 0)

const iterateNthChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  computeBallotScore: (rank: string[], rankIdx: number) => number,
  rankIdx: number,
): ScoreObject<C> => {
  const result = scoresZero(candidates)
  for (const ballot of normalizeBallots(ballots, candidates))
    if (ballot.ranking.length > rankIdx) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const votes = ballot.ranking[rankIdx]!
      for (const candidate of votes)
        result[candidate] += computeBallotScore(votes, rankIdx) * ballot.weight
    }
  return result
}
