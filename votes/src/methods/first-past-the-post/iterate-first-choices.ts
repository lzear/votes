import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots } from '../../utils/normalize'
import { scoresZero } from '../../utils/scores-zero'

export const iterateFirstChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  computeBallotScore: (rank: string[], rankIdx: number) => number,
): ScoreObject<C> =>
  iterateNthChoices(ballots, candidates, computeBallotScore, 0)

export const iterateNthChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  computeBallotScore: (rank: string[], rankIdx: number) => number,
  rankIdx: number,
): ScoreObject<C> => {
  const result: ScoreObject<C> = scoresZero(candidates)
  for (const ballot of normalizeBallots(ballots, candidates))
    if (ballot.ranking.length > rankIdx) {
      const votes = ballot.ranking[rankIdx].filter((c) =>
        candidates.includes(c),
      )
      for (const candidate of votes)
        result[candidate] += computeBallotScore(votes, rankIdx) * ballot.weight
    }
  return result
}
