import { Ballot, ScoreObject, VotingSystem } from '../types'
import { methods } from '../methods'
import { matrixFromBallots } from './makeMatrix'

export const scoresFromBallots = (
  ballots: Ballot[],
  candidates: string[],
  system: VotingSystem,
): ScoreObject => {
  const method = methods[system]
  if ('computeFromBallots' in method)
    return method.computeFromBallots(ballots, candidates)
  return method.computeFromMatrix(matrixFromBallots(ballots, candidates))
}
