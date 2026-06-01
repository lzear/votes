import type { Ballot, Matrix, ScoreObject } from '../types'
import { matrixFromBallots, normalizeBallots, normalizeRanking } from '../utils'
import {
  type QE,
  RoundBallotMethod,
  type TieBreakStep,
} from './round-ballot-method'

export interface TbMeta {
  full?: boolean
  stable?: boolean
  label?: string
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

type TiebreakerResult<C extends string> = {
  ranking: C[][]
  scores?: Partial<Record<C, number>>
}

type TiebreakerFn<C extends string> = (
  tied: C[],
  ballots: Ballot<C>[],
  allCandidates: C[],
) => TiebreakerResult<C>

interface TiebreakerEntry<C extends string> {
  name: string
  fn: TiebreakerFn<C>
}

type AnyCtorWithStatics<C extends string> = AnyCtor<C> & {
  needsMatrix?: boolean
  needsBallot?: boolean
}

const entryToEntry = <C extends string>(
  entry: TbEntry<C>,
): TiebreakerEntry<C> => {
  const Ctor = (
    Array.isArray(entry) ? entry[0] : entry
  ) as AnyCtorWithStatics<C>
  const allOpts = (Array.isArray(entry) ? entry[1] : {}) as TbMeta &
    Record<string, unknown>

  const { full = false, stable: isStable = false, label, ...extra } = allOpts
  const name = label ?? Ctor.name

  const run = (
    tied: C[],
    ballots: Ballot<C>[],
    allCandidates: C[],
  ): TiebreakerResult<C> => {
    const candidates = full ? allCandidates : tied

    let method: { ranking(): C[][]; scores?(): Partial<Record<C, number>> }
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
    const scores =
      typeof method.scores === 'function' ? method.scores() : undefined

    const result = (r: C[][]): TiebreakerResult<C> =>
      scores !== undefined ? { ranking: r, scores } : { ranking: r }

    if (!isStable) return result(ranking)

    return result(
      ranking.flatMap((tier) =>
        tier.length <= 1 || tier.length === tied.length
          ? [tier]
          : run(tier, ballots, allCandidates).ranking,
      ),
    )
  }

  return { name, fn: run }
}

export abstract class RoundBallotMethodTb<
  C extends string,
> extends RoundBallotMethod<C> {
  private readonly tbEntries: TiebreakerEntry<C>[]

  constructor(input: {
    ballots: Ballot<C>[]
    candidates: C[]
    tieBreakers?: TbEntry<C>[]
  }) {
    super(input)
    this.tbEntries = (input.tieBreakers ?? []).map((e) => entryToEntry(e))
  }

  /**
   * Apply tiebreakers sequentially to a set of tied candidates.
   * Returns qualified survivors, eliminated losers, and a trace of each step.
   * If unresolvable, all pending are returned as eliminated.
   */
  protected resolvePending(pending: C[]): {
    qualified: C[]
    eliminated: C[]
    tieBreakSteps: TieBreakStep<C>[]
  } {
    let current = pending
    const promoted: C[] = []
    const tieBreakSteps: TieBreakStep<C>[] = []

    for (const [tbIndex, { name: tbName, fn }] of this.tbEntries.entries()) {
      if (current.length <= 1) break
      const { ranking, scores } = fn(current, this.ballots, this.candidates)
      const last = ranking.at(-1) ?? []
      const upper = ranking.slice(0, -1).flat()
      tieBreakSteps.push({
        tbIndex,
        tbName,
        input: current,
        ranking,
        ...(scores !== undefined ? { scores } : {}),
        resolved: upper,
        remaining: last,
      })
      if (last.length < current.length) {
        promoted.push(...upper)
        current = last
      }
    }

    return { qualified: promoted, eliminated: current, tieBreakSteps }
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

    const {
      qualified: q2,
      eliminated,
      tieBreakSteps,
    } = this.resolvePending(lastTier)
    return {
      qualified: [...qualified, ...q2],
      eliminated,
      scores,
      ...(tieBreakSteps.length > 0 ? { tieBreakSteps } : {}),
    }
  }
}
