import _ from 'lodash'
import { scoresToRanking } from '../utils'

export interface Ranker {
  ranking(): string[][]
}

export abstract class Method implements Ranker {
  constructor(readonly candidates: string[]) {}

  public abstract ranking(): string[][]

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
