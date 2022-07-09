import _ from 'lodash'
import type { Ballot } from '../../types'
import { BallotMethod } from '../../classes/ballot-method'
import { iterateFirstChoices } from '../first-past-the-post/iterate-first-choices'

const deTie = (ranking: string[][], ballots: Ballot[]): string[][] =>
  ranking.flatMap((rank) => {
    if (rank.length < 2) return [rank]

    const scores = iterateFirstChoices(ballots, rank, (r) => 1 / r.length)
    const pickedScores = _.pick(scores, rank)
    const groups = _.groupBy(rank, (c) => pickedScores[c])
    return Object.keys(groups)
      .sort((a, b) => Number(b) - Number(a))
      .map((score) => groups[score])
  })

export const isTied = (ranking: string[][]): boolean =>
  ranking.some((rank) => rank.length > 1)

export class BiggestSupport extends BallotMethod {
  public ranking(): string[][] {
    let ranking = [this.candidates]

    let rankIdx = 0
    while (isTied(ranking) && rankIdx < this.candidates.length) {
      ranking = deTie(ranking, this.ballots)

      rankIdx++
    }

    return ranking
  }
}
