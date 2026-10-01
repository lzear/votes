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
  // Sorted first, so that tiers do not depend on the order of the keys.
  const sorted = (Object.entries(scores) as [C, number][]).toSorted(
    ([, a], [, b]) => b - a,
  )
  const tiers: { score: number; candidates: C[] }[] = []
  for (const [c, score] of sorted) {
    const tier = tiers.at(-1)
    // `===` for infinite scores, whose difference is NaN.
    if (tier && (tier.score === score || tier.score - score <= epsilon))
      tier.candidates.push(c)
    else tiers.push({ score, candidates: [c] })
  }
  return tiers.map((t) => t.candidates)
}
