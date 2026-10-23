import type { Profile, Ranking, Round, ScoreObject } from '../types'
import { deepFreeze } from '../utils/freeze'
import { iterateRanking } from '../utils/iterate-ranking'
import type { EntryOptions, PropsOf } from './tiebreaker'

/**
What every method and `Election` offer: a ranking, and the same on fewer
candidates.
*/
export type Ranker<C extends string> = {
  /**
  Candidates in tiers, best first.
  */
  ranking(): Ranking<C>
  /**
  The same ranker on a subset of its candidates.
  */
  restrict(candidates: readonly C[]): Ranker<C>
  /**
  The ranking built by repeated wins, as `Method#iteratedRanking` explains.
  */
  iteratedRanking(): Ranking<C>
  /**
  Points behind the ranking, for methods that score.
  */
  scores?(): ScoreObject<C>
  /**
  Each round, for methods that eliminate.
  */
  rounds?(): readonly Round<C, unknown>[]
  /**
  Each candidate's chance to win, for random methods.
  */
  probabilities?(): ScoreObject<C>
}

/**
Every method takes the same input, and names itself in traces with `label`:
class names don't survive minifiers.
*/
export type MethodCtor<C extends string> = (new (
  input: Profile<C>,
) => Ranker<C>) & { readonly label: string }

/**
What every voting method extends.
*/
export abstract class Method<C extends string> implements Ranker<C> {
  /**
  Whether the method draws at random, using its `rng`.
  */
  public static readonly isRandom: boolean = false

  /**
  The method as an `Election` method, with options for its constructor and
  `mode` or `label`.
  
  @example
  ```ts
  new Election({
    candidates,
    ballots,
    methods: [Copeland, Borda.with({ mode: 'full' })],
  })
  ```
  */
  public static with<T extends MethodCtor<string>>(
    this: T,
    options: PropsOf<T> & EntryOptions,
  ): readonly [T, PropsOf<T> & EntryOptions] {
    return [this, options]
  }

  /**
  The candidates given, each once.
  */
  public readonly candidates: readonly C[]

  constructor(candidates: readonly C[]) {
    this.candidates = deepFreeze([...new Set(candidates)])
  }

  /**
  Result of the vote: candidates in tiers, best first, the first tier
  listing the winners.
  
  For example, `[['Bear'], ['Sheep'], ['Lion']]` means that Bear wins,
  Sheep is second and Lion third.
  */
  public abstract ranking(): Ranking<C>

  /**
  Return a new instance of the same method restricted to a subset of
  candidates, ranking as if only they ran.
  */
  public abstract restrict(candidates: readonly C[]): this

  /**
  Ranking built by repeated wins instead of the method's own full ranking:
  run the method, record the winning tier, then re-run it restricted to
  the remaining candidates for the next place, and so on.
  
  Differs from `ranking()` whenever the method's full ranking disagrees
  with how it ranks subsets — e.g. instant runoff orders losers by
  elimination time, while iterating re-elects a winner at every place.
  */
  public iteratedRanking(): Ranking<C> {
    return iterateRanking(this)
  }
}
