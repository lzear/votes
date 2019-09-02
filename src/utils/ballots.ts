import * as _ from 'lodash'
import { Ballot, WeightedBallot } from '../types'

export const isBallotEqual = (a: Ballot, b: Ballot) =>
  _.every(a, (rank, k) => _.isEqual(rank.sort(), b[k].sort()))

export const toWeightedBallots = (ballots: Ballot[]) => {
  const weighted: WeightedBallot[] = []
  return ballots.reduce((w, ballot) => {
    const match = w.findIndex(ww => {
      isBallotEqual(ww.ranking, ballot)
    })
    if (match === -1) {
      return [...w, { ranking: ballot, weight: 1 }]
    }
    return w.map((ww, k) => {
      if (k !== match) return ww
      return {
        ranking: w[match].ranking,
        weight: w[match].weight + 1
      }
    })
  }, weighted)
}
