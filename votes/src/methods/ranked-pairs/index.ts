/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import { type Matrix, type Profile, type ScoreObject } from '../../types'
import { scoresAny } from '../../utils/scores-zero'
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
  // Pairwise wins only: a defeat would close a cycle with its own win.
  const allEdges: Edge[] = matrix.array.flatMap((row, from) =>
    row.flatMap((value, to) => {
      const against = matrix.array[to]![from]!
      return value > against
        ? [{ from, to, value, total: value + against }]
        : []
    }),
  )
  // Strongest first, then in the sorter's order. Edges neither tells apart
  // lock together, so that the result does not depend on candidate order.
  const order = (a: Edge, b: Edge) =>
    b.value - a.value || (edgeSorter?.(a, b) ?? 0)
  const groups: Edge[][] = []
  for (const edge of allEdges.toSorted(order)) {
    const group = groups.at(-1)
    if (group && order(group[0]!, edge) === 0) group.push(edge)
    else groups.push([edge])
  }

  let acyclicGraph: Edge[] = []
  for (const edgesToAdd of groups)
    acyclicGraph = generateAcyclicGraph(acyclicGraph, edgesToAdd)

  // Sources of the acyclic graph (no incoming locked edge) win this iteration
  const winnersIdx = matrix.candidates
    .keys()
    .filter((key) => acyclicGraph.every(({ to }) => to !== key))
    .toArray()
  if (winnersIdx.length === 0 || winnersIdx.length === matrix.candidates.length)
    return scoresAny(matrix.candidates, 1)
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
  return {
    ...nextResults,
    ...scoresAny(
      winnersIdx.map((i) => matrix.candidates[i]!),
      maxScore2 + 1,
    ),
  }
}

/**
 * By default, equal-strength pairs are locked simultaneously: if they would
 * form a cycle among themselves, none are locked (most neutral outcome).
 *
 * Pass `edgeSorter` to lock equal-strength pairs in its order instead, like
 * canonical Tideman; pairs it cannot tell apart still lock simultaneously.
 * `byTotalParticipation` (exported from this module) is a ready-made sorter
 * that prefers pairs where more voters expressed a preference.
 *
 * The `Edge` type passed to the sorter has `{ from, to, value, total }`.
 *
 * #### Wikipedia: [Ranked pairs](https://en.wikipedia.org/wiki/Ranked_pairs)
 */
export class RankedPairs<C extends string> extends MatrixScoreMethod<C> {
  private readonly edgeSorter: ((a: Edge, b: Edge) => number) | undefined

  constructor(
    i: (Matrix<C> | Profile<C>) & {
      edgeSorter?: (a: Edge, b: Edge) => number
    },
  ) {
    super(i)
    this.edgeSorter = i.edgeSorter
  }

  public scores(): ScoreObject<C> {
    return computeFromMatrix(this.matrix, this.edgeSorter)
  }
}
