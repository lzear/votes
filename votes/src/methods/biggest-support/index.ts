import _ from 'lodash'
import { Ballot } from '../../types'
import { BallotMethod } from '../../classes/ballot-method'
import { iterateNthChoices } from '../first-past-the-post/iterate-first-choices'

const deTie = (
  ranking: string[][],
  ballots: Ballot[],
  rankIdx: number,
): string[][] =>
  ranking.flatMap((rank) => {
    const scores = iterateNthChoices(
      ballots,
      rank,
      (rank) => 1 / rank.length,
      rankIdx,
    )
    const groups = _.groupBy(rank, (c) => scores[c])
    return Object.values(scores)
      .sort((a, b) => b - a)
      .map((score) => groups[score])
  })

export const isTied = (ranking: string[][]): boolean =>
  ranking.some((rank) => rank.length > 1)

export class BiggestSupport extends BallotMethod {
  public ranking(): string[][] {
    let ranking = [this.candidates]

    let rankIdx = 0
    while (isTied(ranking) && rankIdx < this.candidates.length) {
      ranking = deTie(ranking, this.ballots, rankIdx)

      rankIdx++
    }

    return ranking
  }
}
