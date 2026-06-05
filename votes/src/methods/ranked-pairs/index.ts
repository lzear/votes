/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { groupBy, range, zipObject } from 'lodash-es'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, ScoreObject } from '../../types'
import { subMatrix } from '../../utils/make-matrix'
import { type Edge, generateAcyclicGraph } from './generate-acyclic-graph'

/**
 * Tiebreaker for equal-strength pairs: prefer the pair where more voters
 * expressed a preference (higher total participation). Meaningful only when the
 * matrix comes from `matrixFromBallots` (raw counts). With antisymmetric
 * matrices, `total = value + (-value) = 0` for every edge — all pairs compare
 * equal, so the group falls back to simultaneous processing and ties are
 * preserved.
 */
export const byTotalParticipation = (a: Edge, b: Edge): number =>
  b.total - a.total

const computeFromMatrix = <C extends string>(
  matrix: Matrix<C>,
  edgeSorter: ((a: Edge, b: Edge) => number) | undefined,
): ScoreObject<C> => {
  const allEdges: Edge[] = matrix.array.flatMap(
    (row, from) =>
      row
        .map((value, to) =>
          value > 0 && to !== from
            ? {
                from,
                to,
                value,
                total: value + (matrix.array[to]?.[from] ?? 0),
              }
            : null,
        )
        .filter(Boolean) as Edge[],
  )
  const edgesGroups = groupBy(allEdges, 'value')
  const groups = Object.keys(edgesGroups)
    .toSorted((a, b) => Number(b) - Number(a))
    .map((value) => edgesGroups[value]!)

  let acyclicGraph: Edge[] = []
  for (const edgesToAdd of groups) {
    const sorted = edgeSorter ? edgesToAdd.toSorted(edgeSorter) : null
    const useSequential = sorted?.some(
      (e, i) => i > 0 && edgeSorter!(sorted[i - 1]!, e) !== 0,
    )
    if (useSequential && sorted)
      for (const edge of sorted)
        acyclicGraph = generateAcyclicGraph(acyclicGraph, [edge])
    else acyclicGraph = generateAcyclicGraph(acyclicGraph, edgesToAdd)
  }

  const graphsWinners = range(matrix.candidates.length).filter(
    (_c, key) => !acyclicGraph.some(({ to }) => to === key),
  )
  const scores: Record<number, number> = {}
  for (const curr of graphsWinners) scores[curr] = (scores[curr] ?? 0) + 1

  const maxScore1 = Math.max(...Object.values(scores as Record<string, number>))
  const winnersIdx = range(matrix.candidates.length).filter(
    (i) => scores[i] === maxScore1,
  )
  if (winnersIdx.length === matrix.candidates.length)
    return zipObject(
      matrix.candidates,
      Array.from<number>({ length: matrix.candidates.length }).fill(1),
    ) as ScoreObject<C>
  const nextResults = computeFromMatrix(
    {
      array: matrix.array
        .filter((_c, k) => !winnersIdx.includes(k))
        .map((row) => row.filter((_c, k) => !winnersIdx.includes(k))),
      candidates: matrix.candidates.filter((_c, k) => !winnersIdx.includes(k)),
    },
    edgeSorter,
  )
  const maxScore2 = Math.max(
    ...Object.values(nextResults as Record<string, number>),
  )
  for (const winnerIdx of winnersIdx)
    nextResults[matrix.candidates[winnerIdx]!] = maxScore2 + 1
  return nextResults
}

/**
 * By default, equal-strength pairs are locked simultaneously: if they would
 * form a cycle among themselves, none are locked (most neutral outcome).
 *
 * Pass `edgeSorter` to process equal-strength pairs sequentially instead —
 * the sorter determines which pairs are locked first. `byTotalParticipation`
 * (exported from this module) is a ready-made sorter that prefers pairs where
 * more voters expressed a preference. Sequential processing matches the
 * canonical Tideman algorithm but makes the result order-dependent when the
 * sorter cannot distinguish all tied pairs.
 *
 * The `Edge` type passed to the sorter has `{ from, to, value, total }`.
 *
 * #### Wikipedia: [Ranked pairs](https://en.wikipedia.org/wiki/Ranked_pairs)
 */
export class RankedPairs<C extends string> extends MatrixScoreMethod<C> {
  private readonly edgeSorter: ((a: Edge, b: Edge) => number) | undefined

  constructor(i: Matrix<C> & { edgeSorter?: (a: Edge, b: Edge) => number }) {
    super(i)
    this.edgeSorter = i.edgeSorter
  }

  public scores(): ScoreObject<C> {
    return computeFromMatrix(this.matrix, this.edgeSorter)
  }

  public restrict<D extends C>(candidates: D[]): RankedPairs<D> {
    return new RankedPairs({
      ...subMatrix(this.matrix, candidates),
      ...(this.edgeSorter ? { edgeSorter: this.edgeSorter } : {}),
    })
  }
}
