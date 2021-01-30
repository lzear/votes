import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import toPairs from 'lodash/toPairs'

export const scoresToRanking = (scores: {
  [candidate: string]: number
}): string[][] =>
  sortBy(
    groupBy(toPairs(scores), (e) => e[1]),
    (e) => -e[0][1],
  ).map((e) => e.map((f) => f[0]))
