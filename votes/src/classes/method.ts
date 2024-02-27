import _ from 'lodash-es'

import { scoresToRanking } from '../utils/scores'

export interface Ranker {
  ranking(): string[][]
}

export abstract class Method implements Ranker {
  public static readonly needsMatrix: boolean = false
  public static readonly needsBallot: boolean = false
  public static readonly isRandom: boolean = false

  constructor(readonly candidates: string[]) {}

  /**
   * Result of the vote. The first item lists the winners of the vote.
   *
   * For example this ranking means that `Bear` wins, `Sheep` is second and `Lion` third
   * `[ [ 'Bear' ], [ 'Sheep' ], [ 'Lion' ] ]`
   */
  public abstract ranking(): string[][]

  /**
   * Split tied candidates in a ranking.
   *
   * @param rankingToTieBreak - a ranking in which ties will be attempted to be broken by the current voting system
   */
  public tieBreak(rankingToTieBreak: string[][]): string[][] {
    const ranking = this.ranking()

    const scores = ranking.reduce((acc, rank, idx) => {
      return {
        ...acc,
        ..._.zipObject(rank, new Array(rank.length).fill(-idx)),
      }
    }, {} as { [candidate: string]: number })

    return rankingToTieBreak.flatMap((rank) =>
      scoresToRanking(_.pick(scores, rank)),
    )
  }
}
