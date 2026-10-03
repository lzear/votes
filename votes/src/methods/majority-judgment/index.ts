/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Method } from '../../classes/method'
import { type Ballot, type Matrix, type ScoreObject } from '../../types'
import { matrixFromBallots } from '../../utils'
import { config } from '../../utils/config'
import { sum } from '../../utils/sum'

// Votes per grade, best grade first.
export type Judgements<C extends string> = Record<C, number[]>

const makeJudgement = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
  grades: number,
): Judgements<C> => {
  const judgements = Object.fromEntries(
    candidates.map((c) => [c, Array.from({ length: grades }, () => 0)]),
  ) as Judgements<C>

  for (const ballot of ballots)
    for (const [grade, rank] of ballot.ranking.entries())
      for (const can of rank) judgements[can][grade]! += ballot.weight

  return judgements
}

/**
 * The majority grade: the best grade a majority awards, i.e. the first whose
 * running total passes half the votes. With an even split that is the worse of
 * the two middle grades. -1 without votes.
 */
export const getMedian = (judgement: number[]): number => {
  const half = sum(judgement) / 2
  let total = 0
  return judgement.findIndex((w) => (total += w) > half + config.EPSILON)
}

/**
 * Balinski–Laraki's majority value: the majority grade, then the majority
 * grade once one vote at that grade is taken away, and so on, as runs of
 * [grade, votes it lasts].
 */
const majorityValue = (judgement: number[]): [number, number][] => {
  const w = [...judgement]
  const runs: [number, number][] = []
  for (let g = getMedian(w); g !== -1; g = getMedian(w)) {
    const better = sum(w.slice(0, g))
    const worse = sum(w.slice(g + 1))
    // Votes that can go before the majority grade worsens, or improves.
    const lasts = Math.min(
      better + w[g]! - worse,
      w[g]! + worse - better + 1,
      w[g]!,
    )
    runs.push([g, lasts])
    w[g]! -= lasts
  }
  return runs
}

// Lexicographic, better grade first; running out of votes counts as worst.
const compareValues = (a: [number, number][], b: [number, number][]) => {
  let [i, j] = [0, 0]
  let [leftA, leftB] = [a[0]?.[1] ?? 0, b[0]?.[1] ?? 0]
  while (i < a.length && j < b.length) {
    if (a[i]![0] !== b[j]![0]) return a[i]![0] - b[j]![0]
    const step = Math.min(leftA, leftB)
    leftA -= step
    leftB -= step
    if (leftA <= 0) leftA = a[++i]?.[1] ?? 0
    if (leftB <= 0) leftB = b[++j]?.[1] ?? 0
  }
  return (i < a.length ? 0 : 1) - (j < b.length ? 0 : 1)
}

export class MajorityJudgment<C extends string> extends Method<C> {
  private _judgements: Judgements<C> | undefined
  private _matrix?: Matrix<C>
  // Ballots keep their empty tiers, unlike BallotMethod's: a tier's index is
  // its grade.
  private readonly gradeBallots: Ballot<C>[]
  private readonly unrankedLast: boolean
  public readonly grades: number

  constructor(i: {
    ballots: Ballot<C>[]
    candidates: C[]
    /**
     * Number of grades, best first (default 6). A ballot tier's index is its
     * grade.
     */
    grades?: number
    /**
     * Whether a ballot that grades someone gives the candidates it leaves out
     * the worst grade (default true). Pass false to count only given grades.
     */
    unrankedLast?: boolean
  }) {
    super(i.candidates)
    this.grades = i.grades ?? 6
    this.unrankedLast = i.unrankedLast ?? true
    this.gradeBallots = i.ballots.map((b) => {
      // A candidate gets one grade per ballot, its best.
      const left = new Set(this.candidates)
      const ranking = b.ranking.map((rank) =>
        rank.filter((c) => left.delete(c)),
      )
      const worst = ranking.findLastIndex((rank) => rank.length > 0)
      if (worst >= this.grades)
        throw new RangeError(
          `Grade ${worst + 1} given, but there are ${this.grades} grades`,
        )
      // Those it leaves out get the worst grade, unless it grades no one.
      if (worst !== -1 && left.size > 0 && this.unrankedLast) {
        while (ranking.length < this.grades) ranking.push([])
        ranking[this.grades - 1]!.push(...left)
      }
      return { ...b, ranking }
    })
  }

  public judgements(): Judgements<C> {
    this._judgements ??= makeJudgement(
      this.candidates,
      this.gradeBallots,
      this.grades,
    )
    return this._judgements
  }

  public medians(): ScoreObject<C> {
    const judgements = this.judgements()
    return Object.fromEntries(
      this.candidates.map((c) => [c, getMedian(judgements[c])]),
    ) as ScoreObject<C>
  }

  public ranking(): C[][] {
    const judgements = this.judgements()
    const values = new Map(
      this.candidates.map((c) => [c, majorityValue(judgements[c])]),
    )
    const compare = (a: C, b: C) =>
      compareValues(values.get(a)!, values.get(b)!)
    const tiers: C[][] = []
    for (const c of this.candidates.toSorted(compare)) {
      const last = tiers.at(-1)
      if (last && compare(last[0]!, c) === 0) last.push(c)
      else tiers.push([c])
    }
    return tiers
  }

  public restrict<D extends C>(candidates: D[]): MajorityJudgment<D> {
    return new MajorityJudgment({
      ballots: this.gradeBallots as Ballot<D>[],
      candidates,
      grades: this.grades,
      unrankedLast: this.unrankedLast,
    })
  }

  get matrix(): Matrix<C> {
    this._matrix ??= matrixFromBallots(
      this.gradeBallots,
      this.candidates,
      this.unrankedLast,
    )
    return this._matrix
  }
}
