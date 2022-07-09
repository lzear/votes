import _ from 'lodash'
import type { Ballot, ScoreObject } from '../../types'
import { BallotMethod } from '../../classes/ballot-method'
import { scoresToRanking } from '../../utils'

export type Judgements = {
  [candidate: string]: [number, number, number, number, number, number]
}

const makeJudgement = (candidates: string[], ballots: Ballot[]): Judgements => {
  const judgements: Judgements = _.zipObject(
    candidates,
    [...new Array(candidates.length)].map(() => [0, 0, 0, 0, 0, 0]),
  )

  for (const ballot of ballots)
    for (const [rankIdx, rank] of ballot.ranking.entries())
      for (const can of rank)
        if (candidates.includes(can))
          judgements[can][rankIdx < 5 ? rankIdx : 5] += ballot.weight

  return judgements
}

export const getMedian = (arr: number[]): number => {
  const sumWeights = _.sum(arr)

  let s = 0
  let i = 0
  let prevI = 0
  let med = 0
  for (const j of arr) {
    s += j
    i++
    if (s === sumWeights / 2 + 1) med = (prevI + i) / 2
    else if (s > sumWeights / 2) med = i
    else {
      if (j > 0) prevI = i
      continue
    }
    break
  }
  return med - 1
}

const getMedians = (judgements: Judgements) => {
  const candidates = Object.keys(judgements)

  const medians: { [candidate: string]: number } = {}
  for (const c of candidates) medians[c] = getMedian(judgements[c])
  return medians
}

const majorityJudgmentRanking = (
  candidates: string[],
  ballots: Ballot[],
): string[][] => {
  const judgements = makeJudgement(candidates, ballots)
  return tieBreak(judgements).reverse()
}

const tieBreak = (judgements: Judgements): string[][] => {
  const medians = getMedians(judgements)
  const ranking = scoresToRanking(medians)
  return ranking.flatMap((cs) => {
    const median = medians[cs[0]]
    if (median === -1 || !Number.isInteger(median)) return [cs]
    const j = _.pick(judgements, cs)
    const minGroup = Math.min(...cs.map((c) => j[c][median]))
    if (minGroup <= 0) return [cs]
    const j2 = _.mapValues(j, (jc) =>
      Object.assign([], jc, { [median]: jc[median] - minGroup }),
    )
    return tieBreak(j2)
  })
}

export class MajorityJudgment extends BallotMethod {
  public judgements(): Judgements {
    return makeJudgement(this.candidates, this.ballots)
  }

  public medians(): ScoreObject {
    return getMedians(this.judgements())
  }

  public ranking(): string[][] {
    return majorityJudgmentRanking(this.candidates, this.ballots)
  }
}
