import { groupBy, sortBy, toPairs } from 'lodash-es'

export const scoresToRanking = (scores: {
  [candidate: string]: number
}): string[][] =>
  sortBy(
    groupBy(toPairs(scores), (e) => e[1]),
    (e) => -e[0][1],
  ).map((e) => e.map((f) => f[0]))
