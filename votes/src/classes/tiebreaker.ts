import type { Profile, Round, ScoreObject } from '../types'
import { completeRanking } from '../utils/normalize'
import type { MethodCtor, Ranker } from './method'

/**
 * `Method.with()` options beyond the constructor's.
 *
 * @inline
 */
export interface EntryOptions {
  /**
   * Which candidates the method ranks a tie among: the tied ones
   * (`'restricted'`, default), everyone (`'full'`), or the tied ones, then
   * those of each tie that leaves, until none splits (`'recursive'`).
   */
  mode?: 'restricted' | 'full' | 'recursive'
  /**
   * Name in traces (`TieBreakStep.name`, `StepResult.name`) instead of the
   * class name.
   */
  label?: string
}

/**
 * Constructor props beyond those the election supplies itself.
 */
export type PropsOf<T> = T extends new (input: infer P) => unknown
  ? Omit<P, keyof Profile<string> | 'array' | 'tieBreakers'>
  : unknown

/**
 * An `Election` method: its class, or `Class.with(options)`.
 */
export type ElectionMethod<
  C extends string,
  T extends MethodCtor<C> = MethodCtor<C>,
> = T | readonly [T, PropsOf<T> & EntryOptions]

/**
 * A ranking of tied candidates, and what the method behind it reports.
 *
 * @inline
 */
export interface Run<C extends string> {
  ranking: C[][]
  scores?: ScoreObject<C>
  rounds?: Round<C, unknown>[]
}

export interface Tiebreaker<C extends string> {
  name: string
  run: (tied: C[]) => Run<C>
}

// A tiebreaker backed by a method, which narrows along with it.
export interface MethodTiebreaker<C extends string> extends Tiebreaker<C> {
  restrict: (candidates: readonly C[]) => MethodTiebreaker<C>
}

interface Meta {
  name: string
  mode: NonNullable<EntryOptions['mode']>
}

// Ranks a tie with the method restricted to it, or with its ranking of
// everyone in mode `full`. The method is built on first use.
const fromMethod = <C extends string>(
  build: () => Ranker<C>,
  meta: Meta,
): MethodTiebreaker<C> => {
  let method: Ranker<C> | undefined
  const get = () => (method ??= build())
  const run = (tied: C[]): Run<C> => {
    const m = meta.mode === 'full' ? get() : get().restrict(tied)
    // A tied candidate the method does not rank stays, tied last.
    const ranking = completeRanking(m.ranking(), tied)
    const scores = m.scores?.()
    const rounds = m.rounds?.()
    return {
      ranking:
        meta.mode === 'recursive'
          ? ranking.flatMap((tier) =>
              tier.length <= 1 || tier.length === tied.length
                ? [tier]
                : run(tier).ranking,
            )
          : ranking,
      ...(scores && { scores }),
      ...(rounds && { rounds }),
    }
  }
  return {
    name: meta.name,
    run,
    restrict: (candidates) =>
      fromMethod(() => get().restrict(candidates), meta),
  }
}

// The tiebreaker `entry` names, its method built on `profile`: a round
// method breaks its round ties with `after`.
export const tiebreaker = <C extends string>(
  entry: ElectionMethod<C>,
  profile: Profile<C>,
  after: readonly MethodTiebreaker<C>[] = [],
): MethodTiebreaker<C> => {
  const Ctor = (Array.isArray(entry) ? entry[0] : entry) as MethodCtor<C>
  const opts = (Array.isArray(entry) ? entry[1] : {}) as EntryOptions &
    Record<string, unknown>
  const { mode = 'restricted', label, ...props } = opts
  const input = { ...profile, ...props, tieBreakers: after }
  return fromMethod(() => new Ctor(input), { name: label ?? Ctor.name, mode })
}
