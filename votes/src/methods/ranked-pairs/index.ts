/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { groupBy, range, zipObject } from 'lodash-es'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, ScoreObject } from '../../types'
import { type Edge, generateAcyclicGraph } from './generate-acyclic-graph'

const computeFromMatrix = <C extends string>(
  matrix: Matrix<C>,
): ScoreObject<C> => {
  const allEdges: Edge[] = matrix.array.flatMap(
    (row, from) =>
      row
        .map((value, to) =>
          value > 0 && to !== from ? { from, to, value } : null,
        )
        .filter(Boolean) as Edge[],
  )
  const edgesGroups = groupBy(allEdges, 'value')
  const groups = Object.keys(edgesGroups)
    .toSorted((a, b) => Number(b) - Number(a))
    .map((value) => edgesGroups[value]!)

  let acyclicGraph: Edge[] = []
  for (const edgesToAdd of groups)
    acyclicGraph = generateAcyclicGraph(acyclicGraph, edgesToAdd)

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
  const nextResults = computeFromMatrix({
    array: matrix.array
      .filter((_c, k) => !winnersIdx.includes(k))
      .map((row) => row.filter((_c, k) => !winnersIdx.includes(k))),
    candidates: matrix.candidates.filter((_c, k) => !winnersIdx.includes(k)),
  })
  const maxScore2 = Math.max(
    ...Object.values(nextResults as Record<string, number>),
  )
  for (const winnerIdx of winnersIdx)
    nextResults[matrix.candidates[winnerIdx]!] = maxScore2 + 1
  return nextResults
}

/**
 * #### Wikipedia: [Ranked pairs](https://en.wikipedia.org/wiki/Ranked_pairs)
 */
export class RankedPairs<C extends string> extends MatrixScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return computeFromMatrix(this.matrix)
  }
}
