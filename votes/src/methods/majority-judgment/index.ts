/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mapValues, pick, sum, zipObject } from 'lodash-es'
import { Method } from '../../classes/method'
import type { Ballot, Matrix, ScoreObject } from '../../types'
import { matrixFromBallots, scoresToRanking } from '../../utils'
import { config } from '../../utils/config'

export type Judgements<C extends string> = Record<
  C,
  [number, number, number, number, number, number]
>

const makeJudgement = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
): Judgements<C> => {
  const judgements = zipObject(
    candidates,
    candidates.map(() => [0, 0, 0, 0, 0, 0]),
  ) as Judgements<C>

  for (const ballot of ballots)
    for (const [rankIdx, rank] of ballot.ranking.entries())
      for (const can of rank)
        if (candidates.includes(can))
          judgements[can][Math.min(rankIdx, 5)]! += ballot.weight

  return judgements
}

export const getMedian = (arr: number[]): number => {
  const sumWeights = sum(arr)

  let s = 0
  let i = 0
  let prevI = 0
  let med = 0
  for (const j of arr) {
    const prevS = s
    s += j
    i++
    if (j > 0 && Math.abs(prevS * 2 - sumWeights) < sumWeights * config.EPSILON)
      med = (prevI + i) / 2
    else if (s > sumWeights / 2) med = i
    else {
      if (j > 0) prevI = i
      continue
    }
    break
  }
  return med - 1
}

const getMedians = <C extends string>(judgements: Judgements<C>) => {
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
    const minGroup = Math.min(...cs.map((c) => j[c][median]!))
    if (minGroup <= 0) return [cs]
    const j2 = mapValues(j, (jc) =>
      Object.assign([], jc, { [median]: jc[median]! - minGroup }),
    )
    return tieBreak(j2)
  })
}

export class MajorityJudgment<C extends string> extends Method<C> {
  private _judgements: Judgements<C> | undefined
  private _matrix?: Matrix<C>
  // BallotMethod strips empty tiers; store raw ballots preserving them for grade computation
  private readonly gradeBallots: Ballot<C>[]

  constructor(i: { ballots: Ballot<C>[]; candidates: C[] }) {
    super(i.candidates)
    this.gradeBallots = i.ballots.map((b) => ({
      ...b,
      ranking: b.ranking.map((rank) =>
        rank.filter((c) => this.candidates.includes(c)),
      ),
    }))
  }

  public judgements(): Judgements<C> {
    this._judgements ??= makeJudgement(this.candidates, this.gradeBallots)
    return this._judgements
  }

  public medians(): ScoreObject<C> {
    return getMedians(this.judgements())
  }

  public ranking(): C[][] {
    return majorityJudgmentRanking(this.candidates, this.gradeBallots)
  }

  public restrict<D extends C>(candidates: D[]): Method<D> {
    return new MajorityJudgment({
      ballots: this.gradeBallots.map((b) => ({
        ...b,
        ranking: b.ranking.map(
          (rank) => rank.filter((c) => (candidates as C[]).includes(c)) as D[],
        ),
      })),
      candidates,
    })
  }

  get matrix(): Matrix<C> {
    this._matrix ??= matrixFromBallots(this.gradeBallots, this.candidates)
    return this._matrix
  }
}
