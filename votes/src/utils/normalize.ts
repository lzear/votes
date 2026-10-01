import { type Ballot } from '../types'
import { sum } from './sum'

/**
 * Returns true if the 2 ballots are equivalent. The order of the candidates inside a rank is irrelevant. Reflexive check.
 *
 * @param a - first ballot
 * @param b - second ballot
 */
export const isBallotEqual = (a: string[][], b: string[][]): boolean =>
  JSON.stringify(canonizeRanking(a)) === JSON.stringify(canonizeRanking(b))

export const canonizeRanking = <C extends string>(ranking: C[][]): C[][] =>
  ranking
    .map((rank) => rank.toSorted((a, b) => a.localeCompare(b)))
    .filter((rank) => rank.length > 0)

/**
 * Convert `(string | string[])[]` to `string[][]`.
 * Elements of the input that are strings are converted to singletons.
 *
 * @param rankInput - Input rank
 */
export const normalizeRankInput = (
  rankInput: (string | string[])[],
): string[][] =>
  rankInput.map((rank) => (typeof rank === 'string' ? [rank] : rank))

// Merge ballots with equivalent rankings (see {@link isBallotEqual}), summing
// weights. The first occurrence's ranking representation and order are kept.
const mergeEquivalentBallots = <C extends string, B extends Ballot<C>>(
  ballots: B[],
): B[] => {
  const byRanking = new Map<string, B>()
  for (const ballot of ballots) {
    const key = JSON.stringify(canonizeRanking(ballot.ranking))
    const match = byRanking.get(key)
    if (match)
      byRanking.set(key, { ...match, weight: match.weight + ballot.weight })
    else byRanking.set(key, ballot)
  }
  return byRanking.values().toArray()
}

/**
 * Group ballots by merging equivalent ballots (see {@link isBallotEqual}).
 *
 * @param ballots - ballots to group
 */
export const groupBallots = <C extends string, B extends Ballot<C>>(
  ballots: B[],
): B[] =>
  mergeEquivalentBallots(ballots)
    .filter((b) => b.weight > 0)
    .toSorted((a, b) => b.weight - a.weight)

export const toWeightedBallots = <C extends string>(
  ballots: C[][][],
): Ballot<C>[] =>
  mergeEquivalentBallots(ballots.map((ranking) => ({ ranking, weight: 1 })))

export const checkDuplicatedCandidate = (ranking: string[][]): void => {
  const seen = new Set<string>()
  for (const rank of ranking) {
    const repeated = rank.filter((c) => seen.has(c))
    if (repeated.length > 0)
      throw new Error(
        `Some candidates are present multiple times: ${repeated.join(', ')}`,
      )
    for (const c of rank) seen.add(c)
  }
}

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

/**
 * Prevents cheating!
 *
 * @param ranking - ranking to normalize
 * @param candidates - official candidates
 */
export const normalizeRanking = <C extends string>(
  ranking: string[][],
  candidates: C[],
): C[][] => withUnranked(ranking, candidates)[0]

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
 * {@link normalizeRanking}, with every candidate it leaves out tied last.
 *
 * @param ranking - ranking to complete
 * @param candidates - official candidates
 */
export const completeRanking = <C extends string>(
  ranking: string[][],
  candidates: C[],
): C[][] => appendTier(...withUnranked(ranking, candidates))

/**
 * Prevents cheating!
 *
 * @param ballot - ballot to normalize
 * @param candidates - official candidates
 * @param appendUnranked - if true, append an extra rank at the end of the ballot with all the candidates that are not ranked in the ballot
 */
export const normalizeBallot = <C extends string, B extends Ballot<C>>(
  ballot: B,
  candidates: string[],
  appendUnranked = true,
): B => {
  const [ranking, unranked] = withUnranked(ballot.ranking, candidates as C[])
  return {
    ...ballot,
    ranking:
      appendUnranked && ranking.length > 0
        ? appendTier(ranking, unranked)
        : ranking,
  }
}

/**
 * Gather all the candidates present in `ballots`
 *
 * @param ballots - ranking to normalize
 */
export const candidatesFromBallots = <C extends string>(
  ballots: Ballot<C>[],
): C[] => {
  const candidates: C[] = []
  for (const ballot of ballots) candidates.push(...ballot.ranking.flat())
  return [...new Set(candidates)]
}

export const normalizeBallots = <C extends string, B extends Ballot<C>>(
  ballots: B[],
  candidates?: C[],
  appendUnranked = true,
): B[] => {
  const c = candidates ?? candidatesFromBallots(ballots)
  return ballots.map((ballot) => normalizeBallot(ballot, c, appendUnranked))
}

export const totalBallotsWeight = <C extends string>(
  ballots: Ballot<C>[],
): number => sum(ballots.map((ballot) => ballot.weight))
