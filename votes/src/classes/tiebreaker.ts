import { type Profile, type Round, type ScoreObject } from '../types'
import { completeRanking } from '../utils/normalize'
import { type MethodCtor, type Ranker } from './method'

export interface TbMeta {
  full?: boolean
  stable?: boolean
  label?: string
}

// Constructor props beyond those the tiebreaker supplies itself
export type PropsOf<T> = T extends new (input: infer P) => unknown
  ? Omit<P, keyof Profile<string> | 'array'>
  : unknown

export type TbEntry<C extends string, T extends MethodCtor<C> = MethodCtor<C>> =
  T | readonly [T, PropsOf<T> & TbMeta]

export const tb = <C extends string, T extends MethodCtor<C>>(
  ctor: T,
  opts?: PropsOf<T> & TbMeta,
): TbEntry<C, NoInfer<T>> =>
  opts === undefined ? ctor : ([ctor, opts] as const)

// A ranking of tied candidates, and what the method behind it reports.
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
  restrict: (candidates: C[]) => MethodTiebreaker<C>
}

interface Meta {
  name: string
  full: boolean
  stable: boolean
}

// Ranks a tie with the method restricted to it, or with its ranking of
// everyone when `full`. The method is built on first use.
const fromMethod = <C extends string>(
  build: () => Ranker<C>,
  meta: Meta,
): MethodTiebreaker<C> => {
  let method: Ranker<C> | undefined
  const get = () => (method ??= build())
  const run = (tied: C[]): Run<C> => {
    const m = meta.full ? get() : get().restrict(tied)
    // A tied candidate the method does not rank stays, tied last.
    const ranking = completeRanking(m.ranking(), tied)
    const scores = m.scores?.()
    const rounds = m.rounds?.()
    return {
      ranking: meta.stable
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

// The tiebreaker `entry` names, its method built on `profile`.
export const tiebreaker = <C extends string>(
  entry: TbEntry<C>,
  profile: Profile<C>,
): MethodTiebreaker<C> => {
  const Ctor = (Array.isArray(entry) ? entry[0] : entry) as MethodCtor<C>
  const opts = (Array.isArray(entry) ? entry[1] : {}) as TbMeta &
    Record<string, unknown>
  const { full = false, stable = false, label, ...props } = opts
  return fromMethod(() => new Ctor({ ...profile, ...props }), {
    name: label ?? Ctor.name,
    full,
    stable,
  })
}
