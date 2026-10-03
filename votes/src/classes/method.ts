import { type Profile, type Round, type ScoreObject } from '../types'
import { iterateRanking } from '../utils/iterate-ranking'

export interface Ranker<C extends string> {
  ranking(): C[][]
  // The same ranker on a subset of its candidates.
  restrict(candidates: C[]): Ranker<C>
  // Points behind the ranking, for methods that score.
  scores?(): ScoreObject<C>
  // Each round, for methods that eliminate.
  rounds?(): Round<C, unknown>[]
  // Each candidate's chance to win, for random methods.
  probabilities?(): ScoreObject<C>
}

// Every method takes the same input.
export type MethodCtor<C extends string> = new (input: Profile<C>) => Ranker<C>

export abstract class Method<C extends string> implements Ranker<C> {
  public static readonly isRandom: boolean = false
  public readonly candidates: C[]

  constructor(candidates: C[]) {
    this.candidates = [...new Set(candidates)]
  }

  /**
   * Result of the vote. The first item lists the winners of the vote.
   *
   * For example this ranking means that `Bear` wins, `Sheep` is second and `Lion` third
   * `[ [ 'Bear' ], [ 'Sheep' ], [ 'Lion' ] ]`
   */
  public abstract ranking(): C[][]

  /**
   * Return a new instance of the same method restricted to a subset of
   * candidates.
   */
  public abstract restrict<D extends C>(candidates: D[]): Method<D>

  /**
   * Ranking built by repeated wins instead of the method's own full ranking:
   * run the method, record the winning tier, then re-run it restricted to
   * the remaining candidates for the next place, and so on.
   *
   * Differs from `ranking()` whenever the method's full ranking disagrees
   * with how it ranks subsets — e.g. instant runoff orders losers by
   * elimination time, while iterating re-elects a winner at every place.
   */
  public iteratedRanking(): C[][] {
    return iterateRanking(this)
  }

  /**
   * The ranking, each tie re-ranked by the method restricted to it, until no
   * tie splits further.
   */
  public deTie(): C[][] {
    return this.ranking().flatMap((tier) =>
      tier.length <= 1 || tier.length === this.candidates.length
        ? [tier]
        : this.restrict(tier).deTie(),
    )
  }
}
