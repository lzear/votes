import type { Ballot, Matrix, ScoreObject } from '../types'
import { matrixFromBallots, normalizeBallots, normalizeRanking } from '../utils'
import { type QE, RoundBallotMethod } from './round-ballot-method'

export interface TbMeta {
  full?: boolean
  stable?: boolean
}

type BallotCtor<C extends string> = new (input: {
  ballots: Ballot<C>[]
  candidates: C[]
}) => { ranking(): C[][] }

type MatrixCtor<C extends string> = new (matrix: Matrix<C>) => {
  ranking(): C[][]
}

type CandidatesCtor<C extends string> = new (input: { candidates: C[] }) => {
  ranking(): C[][]
}

export type AnyCtor<C extends string> =
  | BallotCtor<C>
  | MatrixCtor<C>
  | CandidatesCtor<C>

// Extracts extra constructor props beyond the base shape
export type PropsOf<T> = T extends { needsMatrix: true }
  ? Record<never, never>
  : T extends new (input: infer P) => unknown
    ? 'ballots' extends keyof P
      ? Omit<P, 'ballots' | 'candidates'>
      : Omit<P, 'candidates'>
    : Record<never, never>

export type TbEntry<C extends string, T extends AnyCtor<C> = AnyCtor<C>> =
  | T
  | readonly [T, PropsOf<T> & TbMeta]

export const tb = <C extends string, T extends AnyCtor<C>>(
  ctor: T,
  opts?: PropsOf<T> & TbMeta,
): TbEntry<C, T> => (opts === undefined ? ctor : ([ctor, opts] as const))

// ─── Internal: entry to ranked function ──────────────────────────────────────

type TiebreakerFn<C extends string> = (
  tied: C[],
  ballots: Ballot<C>[],
  allCandidates: C[],
) => C[][]

type AnyCtorWithStatics<C extends string> = AnyCtor<C> & {
  needsMatrix?: boolean
  needsBallot?: boolean
}

const entryToFn = <C extends string>(entry: TbEntry<C>): TiebreakerFn<C> => {
  const Ctor = (
    Array.isArray(entry) ? entry[0] : entry
  ) as AnyCtorWithStatics<C>
  const allOpts = (Array.isArray(entry) ? entry[1] : {}) as TbMeta &
    Record<string, unknown>

  const { full = false, stable: isStable = false, ...extra } = allOpts

  const run = (tied: C[], ballots: Ballot<C>[], allCandidates: C[]): C[][] => {
    const candidates = full ? allCandidates : tied

    let method: { ranking(): C[][] }
    if (Ctor.needsMatrix === true)
      method = new (Ctor as unknown as MatrixCtor<C>)(
        matrixFromBallots(ballots, candidates),
      )
    else if (Ctor.needsBallot === true)
      method = new (Ctor as unknown as BallotCtor<C>)({
        ballots: normalizeBallots(ballots, candidates),
        candidates,
        ...extra,
      })
    else
      method = new (Ctor as unknown as CandidatesCtor<C>)({
        candidates,
        ...extra,
      })

    const ranking = full
      ? normalizeRanking(method.ranking(), tied)
      : method.ranking()

    if (!isStable) return ranking

    return ranking.flatMap((tier) =>
      tier.length <= 1 || tier.length === tied.length
        ? [tier]
        : run(tier, ballots, allCandidates),
    )
  }

  return run
}

export abstract class RoundBallotMethodTb<
  C extends string,
> extends RoundBallotMethod<C> {
  private readonly tbFns: TiebreakerFn<C>[]

  constructor(input: {
    ballots: Ballot<C>[]
    candidates: C[]
    tieBreakers?: TbEntry<C>[]
  }) {
    super(input)
    this.tbFns = (input.tieBreakers ?? []).map((e) => entryToFn(e))
  }

  /**
   * Apply tiebreakers sequentially to a set of tied candidates.
   * Returns { qualified: survivors, eliminated: losers }.
   * If unresolvable, all pending are returned as eliminated.
   */
  protected resolvePending(pending: C[]): { qualified: C[]; eliminated: C[] } {
    let current = pending
    const promoted: C[] = []

    for (const fn of this.tbFns) {
      if (current.length <= 1) break
      const ranking = fn(current, this.ballots, this.candidates)
      const last = ranking.at(-1) ?? []
      const upper = ranking.slice(0, -1).flat()
      if (last.length < current.length) {
        promoted.push(...upper)
        current = last
      }
    }

    return { qualified: promoted, eliminated: current }
  }
}

/**
 * Each round: rank candidates, eliminate the last-tier candidate(s).
 * Tiebreakers are applied when multiple candidates share the last tier.
 */
export abstract class TbEliminateLast<
  C extends string,
> extends RoundBallotMethodTb<C> {
  protected abstract oneRound(
    candidates: C[],
    idx: number,
  ): { ranking: C[][]; scores: ScoreObject<C> }

  protected round(candidates: C[], idx: number): QE<C> {
    if (candidates.length < 2)
      return {
        qualified: [],
        eliminated: candidates,
        scores: this.roundScoresZero(candidates),
      }

    const { ranking, scores } = this.oneRound(candidates, idx)
    const qualified = ranking.slice(0, -1).flat()
    const lastTier = ranking.at(-1) ?? []

    if (lastTier.length <= 1) return { qualified, eliminated: lastTier, scores }

    const { qualified: q2, eliminated } = this.resolvePending(lastTier)
    return { qualified: [...qualified, ...q2], eliminated, scores }
  }
}
