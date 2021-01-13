import { Ballot, ScoreObject } from '../../types'
import { normalizeBallots } from '../../utils/normalize'
import { scoresZero } from '../../utils/scoresZero'

export const iterateFirstChoices = (
  ballots: Ballot[],
  candidates: string[],
  compute: (rank: string[]) => number,
): ScoreObject => {
  const result: ScoreObject = scoresZero(candidates)
  normalizeBallots(ballots, candidates).forEach((ballot) => {
    if (ballot.ranking.length) {
      const votes = ballot.ranking[0].filter((c) => candidates.includes(c))
      votes.forEach(
        (candidate, idx, rank) =>
          (result[candidate] += compute(rank) * ballot.weight),
      )
    }
  })
  return result
}
