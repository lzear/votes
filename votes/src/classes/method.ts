import { normalizeRanking } from '../utils'
import { iterateRanking } from '../utils/iterate-ranking'
import { canonizeRanking } from '../utils/normalize'

export interface Ranker<C extends string> {
  ranking(): C[][]
}

export abstract class Method<C extends string> implements Ranker<C> {
  public static readonly needsMatrix: boolean = false
  public static readonly needsBallot: boolean = false
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

  public canonicalRanking(): C[][] {
    return canonizeRanking(this.ranking())
  }

  /**
   * Return a new instance of the same method restricted to a subset of
   * candidates.
   */
  public abstract restrict<D extends C>(candidates: D[]): Method<D>

  public restrictRanking<D extends C>(candidates: D[]): D[][] {
    return normalizeRanking(this.ranking(), candidates)
  }

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

  public deTie(): C[][] {
    return this.ranking().flatMap((r) =>
      r.length <= 1 ? [r] : this.restrict(r).ranking(),
    )
  }
}
