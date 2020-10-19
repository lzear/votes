import * as _ from 'lodash'

export const scoresToRanking = (scores: {
  [candidate: string]: number
}): string[][] =>
  _.sortBy(
    _.groupBy(_.toPairs(scores), (e) => e[1]),
    (e) => -e[0][1],
  ).map((e) => e.map((f) => f[0]))
