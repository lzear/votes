import * as _ from 'lodash'
import { WeightedBallot, Ballot } from '../types'

export const scores2ranking = (scores: { score: number; name: string }[]) =>
  _.sortBy(_.values(_.groupBy(scores, 'score')), r => -r[0].score).map(r => r.map(rr => rr.name))

export const cleanWeightedBallots = (ballots: WeightedBallot[], candidates: string[]) =>
  ballots.map(ballot => ({
    weight: ballot.weight,
    ranking: ballot.ranking
      .map(rank => _.union(rank, candidates).filter(r => r.length))
      .filter(ranking => ranking.length)
  }))

export const cleanBallots = (ballots: Ballot[], candidates: string[]) =>
  ballots.map(ballot =>
    ballot
      .map(rank => _.union(rank, candidates).filter(r => r.length))
      .filter(ranking => ranking.length)
  )
