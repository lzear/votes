import groupBy from 'lodash-es/groupBy'
import sortBy from 'lodash-es/sortBy'
import toPairs from 'lodash-es/toPairs'

export const scoresToRanking = (scores: {
  [candidate: string]: number
}): string[][] =>
  sortBy(
    groupBy(toPairs(scores), (e) => e[1]),
    (e) => -e[0][1],
  ).map((e) => e.map((f) => f[0]))
