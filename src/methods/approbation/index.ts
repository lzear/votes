import {
  SystemUsingRankings,
  ScoreObject,
  VotingSystem,
  Ballot,
} from '../../types'
import { iterateFirstChoices } from '../first-past-the-post'

export const approbation: SystemUsingRankings = {
  type: VotingSystem.Approbation,
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject {
    return iterateFirstChoices(ballots, candidates, () => 1)
  },
}
