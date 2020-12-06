import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import toPairs from 'lodash/toPairs'
import { Ballot, ScoreObject, VotingSystem } from '../types'
import { methods } from '../methods'
import { matrixFromBallots } from './makeMatrix'

export const scoresToRanking = (scores: {
  [candidate: string]: number
}): string[][] =>
  sortBy(
    groupBy(toPairs(scores), (e) => e[1]),
    (e) => -e[0][1],
  ).map((e) => e.map((f) => f[0]))

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
