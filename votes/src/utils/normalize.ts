import { type Ballot } from '../types'
import { sum } from './sum'

export const weightOf = <C extends string>({
  weight = 1,
}: Ballot<C>): number => {
  if (!Number.isFinite(weight) || weight < 0)
    throw new RangeError(`Weight ${weight} should be finite and not negative`)
  return weight
}

export const canonizeRanking = <C extends string>(ranking: C[][]): C[][] =>
  ranking.map((rank) => rank.toSorted((a, b) => a.localeCompare(b)))

// Merge ballots with the same tiers, whatever the order within each, summing
// weights. Empty tiers count: majority judgment reads a tier's index as its
// grade. The first occurrence's ranking representation and order are kept.
const mergeEquivalentBallots = <C extends string, B extends Ballot<C>>(
  ballots: B[],
): B[] => {
  const byRanking = new Map<string, B>()
  for (const ballot of ballots) {
    const key = JSON.stringify(canonizeRanking(ballot.ranking))
    const match = byRanking.get(key)
    if (match)
      byRanking.set(key, {
        ...match,
        weight: weightOf(match) + weightOf(ballot),
      })
    else byRanking.set(key, ballot)
  }
  return byRanking.values().toArray()
}

/**
 * Merges ballots with the same tiers, summing weights, heaviest first.
 */
export const groupBallots = <C extends string, B extends Ballot<C>>(
  ballots: B[],
): B[] =>
  mergeEquivalentBallots(ballots)
    .filter((b) => weightOf(b) > 0)
    .toSorted((a, b) => weightOf(b) - weightOf(a))

export const toWeightedBallots = <C extends string>(
  ballots: C[][][],
): Ballot<C>[] =>
  mergeEquivalentBallots(ballots.map((ranking) => ({ ranking, weight: 1 })))

/**
 * Remove candidates that are duplicated inside a ranking. Prevents cheating!
 *
 * @param ranking - input ranking
 */
export const removeDuplicatedCandidates = <C extends string>(
  ranking: C[][],
): C[][] => {
  const result: C[][] = []
  const used = new Set<C>()
  for (const cur of ranking) {
    const unique = [...new Set(cur).difference(used)]
    if (unique.length === 0) continue

    result.push(unique)
    for (const c of unique) used.add(c)
  }
  return result
}

/**
 * Remove candidates in `ranking` that don't exist in `candidates`. Prevents cheating!
 *
 * @param ranking - ranking to check
 * @param candidates - official candidates
 */
export const removeInvalidCandidates = <C extends string>(
  ranking: string[][],
  candidates: C[],
): C[][] =>
  ranking
    .map((names) =>
      names.filter((name): name is C =>
        (candidates as string[]).includes(name),
      ),
    )
    .filter((rank) => rank.length > 0)

// The normalized ranking, and the candidates it leaves out. One pass: both
// run on every ballot, every round.
const withUnranked = <C extends string>(
  ranking: string[][],
  candidates: C[],
): [C[][], C[]] => {
  const left = new Set<string>(candidates)
  const ranked: C[][] = []
  for (const rank of ranking) {
    if (left.size === 0) break
    const kept = rank.filter((c): c is C => left.delete(c))
    if (kept.length > 0) ranked.push(kept)
  }
  return [ranked, [...left] as C[]]
}

const appendTier = <C extends string>(ranking: C[][], tier: C[]): C[][] =>
  tier.length > 0 ? [...ranking, tier] : ranking

/**
 * `ranking` with only `candidates`, each once, and those it leaves out tied
 * last.
 */
export const completeRanking = <C extends string>(
  ranking: string[][],
  candidates: C[],
): C[][] => appendTier(...withUnranked(ranking, candidates))

/**
 * Keeps only `candidates` in each ballot, each at its first rank. With
 * `appendUnranked` (default true), a ballot that ranks anyone also ranks the
 * rest, tied last.
 */
export const normalizeBallots = <C extends string, B extends Ballot<C>>(
  ballots: B[],
  candidates: C[],
  appendUnranked = true,
): B[] =>
  ballots.map((ballot) => {
    const [ranking, unranked] = withUnranked(ballot.ranking, candidates)
    return {
      ...ballot,
      ranking:
        appendUnranked && ranking.length > 0
          ? appendTier(ranking, unranked)
          : ranking,
    }
  })

export const totalBallotsWeight = <C extends string>(
  ballots: Ballot<C>[],
): number => sum(ballots.map((ballot) => weightOf(ballot)))

// The ballots ranking any of `candidates`: the others are blank to them.
export const nonBlank = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): Ballot<C>[] => {
  const running = new Set(candidates)
  return ballots.filter((b) =>
    b.ranking.some((t) => t.some((c) => running.has(c))),
  )
}
