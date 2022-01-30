import { Ballot, ScoreObject } from '../../types'
import { normalizeBallots } from '../../utils'
import { scoresZero } from '../../utils/scores-zero'

export const iterateFirstChoices = (
  ballots: Ballot[],
  candidates: string[],
  computeBallotScore: (rank: string[]) => number,
): ScoreObject => {
  const result: ScoreObject = scoresZero(candidates)
  for (const ballot of normalizeBallots(ballots, candidates))
    if (ballot.ranking.length > 0) {
      const votes = ballot.ranking[0].filter((c) => candidates.includes(c))
      for (const candidate of votes)
        result[candidate] += computeBallotScore(votes) * ballot.weight
    }
  return result
}
