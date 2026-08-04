import type { Ranker } from '../classes/method'

// A ranker that can re-run itself on a subset of its candidates.
export interface RestrictableRanker<C extends string> extends Ranker<C> {
  restrict(candidates: C[]): RestrictableRanker<C>
}

/**
 * Ranking built by repeated wins: take the ranker's winning tier, then re-run
 * the full ranker restricted to the remaining candidates to fill the next
 * place, and so on.
 *
 * Differs from `ranking()` whenever a method's full ranking disagrees with
 * how it ranks subsets: round-based methods order losers by elimination time,
 * and score methods can reshuffle once a winner's votes are gone.
 */
export const iterateRanking = <C extends string>(
  ranker: RestrictableRanker<C>,
): C[][] => {
  const tiers: C[][] = []
  let current = ranker
  for (;;) {
    const [winners = [], ...rest] = current.ranking()
    const remaining = rest.flat()
    if (winners.length === 0) {
      // Ranker placed nobody first (shouldn't happen) — keep the rest as one
      // tier rather than looping forever.
      if (remaining.length > 0) tiers.push(remaining)
      return tiers
    }
    tiers.push(winners)
    if (remaining.length === 0) return tiers
    if (remaining.length === 1) {
      tiers.push(remaining)
      return tiers
    }
    current = current.restrict(remaining)
  }
}
