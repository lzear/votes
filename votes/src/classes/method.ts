export interface Ranker<C extends string> {
  ranking(): C[][]
}

export abstract class Method<C extends string> implements Ranker<C> {
  public static readonly needsMatrix: boolean = false
  public static readonly needsBallot: boolean = false
  public static readonly isRandom: boolean = false

  constructor(readonly candidates: C[]) {}

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

  /**
   * Split tied candidates in a ranking.
   *
   * @param rankingToTieBreak - a ranking in which ties will be attempted to be broken by the current voting system
   */
  public tieBreak(rankingToTieBreak: C[][]): C[][] {
    const ranking = this.ranking()

    const scores = ranking.reduce<Record<C, number>>(
      (acc, rank, idx) => {
        return {
          ...acc,
          ...zipObject(rank, Array.from({ length: rank.length }).fill(-idx)),
        }
      },
      {} as Record<C, number>,
    )

    return rankingToTieBreak.flatMap((rank) =>
      scoresToRanking(pick(scores, rank)),
    )
  }
}
