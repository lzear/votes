import { mapValues, pick, sum, zipObject } from 'lodash-es'
import { BallotMethod } from '../../classes/ballot-method'
import type { Ballot, ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'

export type Judgements<C extends string> = Record<
  C,
  [number, number, number, number, number, number]
>

const makeJudgement = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
): Judgements<C> => {
  const judgements: Judgements<C> = zipObject(
    candidates,
    candidates.map(() => [0, 0, 0, 0, 0, 0]),
  ) as Judgements<C>

  for (const ballot of ballots)
    for (const [rankIdx, rank] of ballot.ranking.entries())
      for (const can of rank)
        if (candidates.includes(can))
          judgements[can][Math.min(rankIdx, 5)] += ballot.weight

  return judgements
}

export const getMedian = (arr: number[]): number => {
  const sumWeights = sum(arr)

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

const getMedians = <C extends string>(
  judgements: Judgements<C>,
): ScoreObject<C> => {
  const candidates = Object.keys(judgements) as C[]

  const medians = {} as Record<C, number>
  for (const c of candidates) medians[c] = getMedian(judgements[c])
  return medians
}

const majorityJudgmentRanking = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
): C[][] => {
  const judgements = makeJudgement(candidates, ballots)
  return tieBreak(judgements).toReversed()
}

const tieBreak = <C extends string>(judgements: Judgements<C>): C[][] => {
  const medians = getMedians(judgements)
  const ranking = scoresToRanking(medians)
  return ranking.flatMap((cs) => {
    const median = medians[cs[0]!]
    if (median === -1 || !Number.isInteger(median)) return [cs]
    const j = pick(judgements, cs)
    const minGroup = Math.min(...cs.map((c) => j[c][median]))
    if (minGroup <= 0) return [cs]
    const j2 = mapValues(j, (jc) =>
      Object.assign([], jc, { [median]: jc[median] - minGroup }),
    )
    return tieBreak(j2)
  })
}

export class MajorityJudgment<C extends string> extends BallotMethod<C> {
  public judgements(): Judgements<C> {
    return makeJudgement(this.candidates, this.ballots)
  }

  public medians(): ScoreObject<C> {
    return getMedians(this.judgements())
  }

  public ranking(): C[][] {
    return majorityJudgmentRanking(this.candidates, this.ballots)
  }
}
