import { pick } from 'lodash-es'
import { config } from './config'

export const applyRankingAsTiebreaker = <C extends string>(
  fallbackRanking: C[][],
  before: C[][],
): C[][] => {
  const scores: Record<string, number> = {}
  for (const [i, tier] of fallbackRanking.entries())
    for (const c of tier) scores[c] = -i
  return before.flatMap((tier) => scoresToRanking(pick(scores, tier)))
}

export const scoresToRanking = <C extends string>(
  scores: Record<C, number>,
  epsilon = config.EPSILON,
): C[][] => {
  const buckets: { score: number; candidates: C[] }[] = []
  for (const [c, score] of Object.entries(scores) as [C, number][]) {
    const bucket = buckets.find((b) => Math.abs(b.score - score) <= epsilon)
    if (bucket) bucket.candidates.push(c)
    else buckets.push({ score, candidates: [c] })
  }
  return buckets.toSorted((a, b) => b.score - a.score).map((b) => b.candidates)
}
