import * as _ from 'lodash'
import { ScoreObject } from './types'

export const score2array = (score: ScoreObject): string[][] => {
  const idsByScore = _.mapValues(_.groupBy(_.toPairs(score), pair => pair[1]), g =>
    g.map(gg => gg[0])
  )
  return Object.keys(idsByScore)
    .map(Number)
    .sort((a, b) => b - a)
    .map(s => idsByScore[s])
}
