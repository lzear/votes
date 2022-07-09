import type { Ballot, ScoreObject } from '../../types'
import { scoresZero } from '../../utils/scores-zero'
import { normalizeBallots } from '../../utils/normalize'

export const iterateFirstChoices = (
  ballots: Ballot[],
  candidates: string[],
  computeBallotScore: (rank: string[], rankIdx: number) => number,
): ScoreObject => iterateNthChoices(ballots, candidates, computeBallotScore, 0)

export const iterateNthChoices = (
  ballots: Ballot[],
  candidates: string[],
  computeBallotScore: (rank: string[], rankIdx: number) => number,
  rankIdx: number,
): ScoreObject => {
  const result: ScoreObject = scoresZero(candidates)
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
