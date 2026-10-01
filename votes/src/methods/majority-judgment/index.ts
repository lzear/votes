/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Method } from '../../classes/method'
import { type Ballot, type Matrix, type ScoreObject } from '../../types'
import { matrixFromBallots, scoresToRanking } from '../../utils'
import { config } from '../../utils/config'
import { sum } from '../../utils/sum'

export type Judgements<C extends string> = Record<
  C,
  [number, number, number, number, number, number]
>

const makeJudgement = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
): Judgements<C> => {
  const judgements = Object.fromEntries(
    candidates.map((c) => [c, [0, 0, 0, 0, 0, 0]]),
  ) as Judgements<C>

  for (const ballot of ballots)
    for (const [rankIdx, rank] of ballot.ranking.entries())
      for (const can of rank)
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

const tieBreak = <C extends string>(judgements: Judgements<C>): C[][] => {
  const medians = getMedians(judgements)
  const ranking = scoresToRanking(medians)
  return ranking.flatMap((cs) => {
    const median = medians[cs[0]!]
    if (median === -1 || !Number.isSafeInteger(median)) return [cs]
    const minGroup = Math.min(...cs.map((c) => judgements[c][median]!))
    if (minGroup <= 0) return [cs]
    return tieBreak(
      Object.fromEntries(
        cs.map((c) => {
          const jc = judgements[c]
          return [c, jc.with(median, jc[median]! - minGroup)]
        }),
      ) as Judgements<C>,
    )
  })
}

export class MajorityJudgment<C extends string> extends Method<C> {
  public static readonly needsBallot = true
  private _judgements: Judgements<C> | undefined
  private _matrix?: Matrix<C>
  // Ballots keep their empty tiers, unlike BallotMethod's: a tier's index is
  // its grade.
  private readonly gradeBallots: Ballot<C>[]

  constructor(i: { ballots: Ballot<C>[]; candidates: C[] }) {
    super(i.candidates)
    const candidates = new Set(this.candidates)
    this.gradeBallots = i.ballots.map((b) => {
      // A candidate gets one grade per ballot, its best.
      const graded = new Set<C>()
      return {
        ...b,
        ranking: b.ranking.map((rank) =>
          rank.filter((c) => {
            if (!candidates.has(c) || graded.has(c)) return false
            graded.add(c)
            return true
          }),
        ),
      }
    })
  }

  public judgements(): Judgements<C> {
    this._judgements ??= makeJudgement(this.candidates, this.gradeBallots)
    return this._judgements
  }

  public medians(): ScoreObject<C> {
    return getMedians(this.judgements())
  }

  public ranking(): C[][] {
    return tieBreak(this.judgements()).toReversed()
  }

  public restrict<D extends C>(candidates: D[]): Method<D> {
    return new MajorityJudgment({
      ballots: this.gradeBallots as Ballot<D>[],
      candidates,
    })
  }

  get matrix(): Matrix<C> {
    this._matrix ??= matrixFromBallots(this.gradeBallots, this.candidates)
    return this._matrix
  }
}
