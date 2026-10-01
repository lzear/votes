import { config } from './config'
import { completeRanking } from './normalize'

export const applyRankingAsTiebreaker = <C extends string>(
  fallbackRanking: C[][],
  before: C[][],
): C[][] => {
  const scores = {} as Record<C, number>
  // Candidates the fallback does not rank stay, tied below those it does.
  for (const [i, tier] of completeRanking(
    fallbackRanking,
    before.flat(),
  ).entries())
    for (const c of tier) scores[c] = -i
  return before.flatMap((tier) =>
    scoresToRanking(
      Object.fromEntries(tier.map((c) => [c, scores[c]])) as Record<C, number>,
    ),
  )
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
