import { pick } from 'lodash-es'
import type { TieBreaker } from './election'
import { Borda } from './methods/borda'
import { Copeland } from './methods/copeland'
import { FirstPastThePost } from './methods/first-past-the-post'
import type { Ballot } from './types'
import { matrixFromBallots, scoresToRanking } from './utils'
import { shuffleArray } from './utils/shuffle-array'

const applyRankingAsTiebreaker = <C extends string>(
  fallbackRanking: C[][],
  before: C[][],
): C[][] => {
  const scores: Record<string, number> = {}
  for (const [i, tier] of fallbackRanking.entries())
    for (const c of tier) scores[c] = -i
  return before.flatMap((tier) => scoresToRanking(pick(scores, tier)))
}

export interface TiebreakOptions<C extends string> {
  tiebreakers: TieBreaker<C>[]
}

/** Apply a chain of tiebreakers to a ranking until fully resolved or exhausted. */
export const tiebreak = <C extends string>(
  ranking: C[][],
  { tiebreakers }: TiebreakOptions<C>,
): C[][] => {
  let current = ranking
  for (const tb of tiebreakers) {
    if (current.every((r) => r.length <= 1)) break
    current = tb.tieBreak(current)
  }
  return current
}

/** No-op: returns the ranking unchanged. */
export const noTieBreaker = <C extends string>(): TieBreaker<C> => ({
  tieBreak: (before) => before,
})

/** Resolve ties randomly using the given RNG. */
export const rngTieBreaker = <C extends string>(
  rng: () => number = Math.random,
): TieBreaker<C> => ({
  tieBreak: (before) =>
    before.flatMap((tier) =>
      tier.length <= 1 ? [tier] : shuffleArray(tier, rng).map((c) => [c]),
    ),
})

/** Resolve ties using Copeland scores from the full ballot set. */
export const copelandTieBreaker = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): TieBreaker<C> => ({
  tieBreak: (before) => {
    const ranking = new Copeland(
      matrixFromBallots(ballots, candidates),
    ).ranking()
    return applyRankingAsTiebreaker(ranking, before)
  },
})

/** Resolve ties using Borda scores from the full ballot set. */
export const bordaTieBreaker = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): TieBreaker<C> => ({
  tieBreak: (before) => {
    const ranking = new Borda({ ballots, candidates }).ranking()
    return applyRankingAsTiebreaker(ranking, before)
  },
})

/** Resolve ties using FPTP (head-to-head) from the full ballot set. */
export const headToHeadTieBreaker = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
): TieBreaker<C> => ({
  tieBreak: (before) => {
    const ranking = new FirstPastThePost({ ballots, candidates }).ranking()
    return applyRankingAsTiebreaker(ranking, before)
  },
})
