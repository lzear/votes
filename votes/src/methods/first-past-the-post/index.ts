import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'
import { iterateFirstChoices } from './iterateFirstChoices'

export const firstPastThePost: SystemUsingRankings = {
  type: VotingSystem.FirstPastThePost,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    return iterateFirstChoices(ballots, candidates, (rank) => 1 / rank.length)
  },
}
