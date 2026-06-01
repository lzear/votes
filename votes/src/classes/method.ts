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

  protected abstract restrict<D extends C>(candidates: D[]): Method<D>

  public deTie(): C[][] {
    return this.ranking().flatMap((r) =>
      r.length <= 1 ? [r] : this.restrict(r).ranking(),
    )
  }
}
