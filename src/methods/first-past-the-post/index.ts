import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'
import { scoresZero } from '../../utils/scoresZero'

export const iterateFirstChoices = (
  ballots: Ballot[],
  candidates: string[],
  compute: (rank: string[]) => number,
): ScoreObject => {
  const result: ScoreObject = scoresZero(candidates)
  ballots.forEach((ballot) => {
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

export const firstPastThePost: SystemUsingRankings = {
  type: VotingSystem.FirstPastThePost,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    return iterateFirstChoices(ballots, candidates, (rank) => 1 / rank.length)
  },
}
