import {
  type Ballot,
  type Profile,
  type QE,
  type ScoreObject,
  type TieBreakStep,
} from '../types'
import { completeRanking } from '../utils/normalize'
import { type MethodCtor } from './method'
import { RoundBallotMethod } from './round-ballot-method'

export interface TbMeta {
  full?: boolean
  stable?: boolean
  label?: string
}

// Constructor props beyond those the tiebreaker supplies itself
export type PropsOf<T> = T extends new (input: infer P) => unknown
  ? Omit<P, 'array' | 'ballots' | 'candidates'>
  : unknown

export type TbEntry<C extends string, T extends MethodCtor<C> = MethodCtor<C>> =
  T | readonly [T, PropsOf<T> & TbMeta]

export const tb = <C extends string, T extends MethodCtor<C>>(
  ctor: T,
  opts?: PropsOf<T> & TbMeta,
): TbEntry<C, NoInfer<T>> =>
  opts === undefined ? ctor : ([ctor, opts] as const)

interface TiebreakerResult<C extends string> {
  ranking: C[][]
  scores?: Partial<Record<C, number>>
}

type TiebreakerFn<C extends string> = (
  tied: C[],
  ballots: Ballot<C>[],
  allCandidates: C[],
) => TiebreakerResult<C>

export interface TiebreakerEntry<C extends string> {
  name: string
  fn: TiebreakerFn<C>
}

const entryToEntry = <C extends string>(
  entry: TbEntry<C>,
  unrankedLast: boolean,
): TiebreakerEntry<C> => {
  const Ctor = (Array.isArray(entry) ? entry[0] : entry) as MethodCtor<C>
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

    // Forwarding unrankedLast keeps the host method's setting: the ctor
    // would otherwise re-append unranked candidates with its default of true.
    const method = new Ctor({ ballots, candidates, unrankedLast, ...extra })

    // A tied candidate the tiebreaker does not rank stays, tied last.
    const ranking = completeRanking(method.ranking(), tied)
    const scores = method.scores?.()

    const result = (r: C[][]): TiebreakerResult<C> =>
      scores === undefined ? { ranking: r } : { ranking: r, scores }

    return result(
      isStable
        ? ranking.flatMap((tier) =>
            tier.length <= 1 || tier.length === tied.length
              ? [tier]
              : run(tier, ballots, allCandidates).ranking,
          )
        : ranking,
    )
  }

  return { name, fn: run }
}

export abstract class RoundBallotMethodTb<
  C extends string,
  I = undefined,
> extends RoundBallotMethod<C, I> {
  private readonly tbEntries: TiebreakerEntry<C>[]

  constructor(input: Profile<C> & { tieBreakers?: TbEntry<C>[] }) {
    super(input)
    this.tbEntries = [
      ...this.builtInTieBreakers(),
      ...(input.tieBreakers ?? []).map((e) =>
        entryToEntry(e, this.unrankedLast),
      ),
    ]
  }

  /**
   * Tiebreakers the method applies before the caller's.
   */
  protected builtInTieBreakers(): TiebreakerEntry<C>[] {
    return []
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
        ...(scores !== undefined && { scores }),
        resolved: upper,
        remaining: last,
      })
      if (last.length >= current.length) continue

      promoted.push(...upper)
      current = last
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
  I = undefined,
> extends RoundBallotMethodTb<C, I> {
  protected abstract oneRound(
    candidates: C[],
    idx: number,
  ): { ranking: C[][]; scores: ScoreObject<C> }

  protected round(candidates: C[], idx: number): QE<C, I> {
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
      ...(tieBreakSteps.length > 0 && { tieBreakSteps }),
    }
  }
}
