import groupBy from 'lodash/groupBy'
import range from 'lodash/range'
import zipObject from 'lodash/zipObject'
import type { Matrix, ScoreObject } from '../../types'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import { generateAcyclicGraph } from './generate-acyclic-graph'

type Edge = { from: number; to: number; value: number }

const computeFromMatrix = (matrix: Matrix): ScoreObject => {
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
    .sort((a, b) => Number(b) - Number(a))
    .map((value) => edgesGroups[value])

  const acyclicGraph = groups.reduce(
    (graph: Edge[], edgesToAdd) => generateAcyclicGraph(graph, edgesToAdd),
    [] as Edge[],
  )
  const graphsWinners = range(matrix.candidates.length).filter(
    (candidate, key) => !acyclicGraph.some(({ to }) => to === key),
  )
  const scores = graphsWinners.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1
    return acc
  }, {} as { [k: number]: number })
  const maxScore1 = Math.max(...Object.values(scores))
  const winnersIdx = range(matrix.candidates.length).filter(
    (i) => scores[i] === maxScore1,
  )
  if (winnersIdx.length === matrix.candidates.length)
    return zipObject(
      matrix.candidates,
      new Array(matrix.candidates.length).fill(1),
    )
  const nextResults = computeFromMatrix({
    array: matrix.array
      .filter((c, k) => !winnersIdx.includes(k))
      .map((row) => row.filter((c, k) => !winnersIdx.includes(k))),
    candidates: matrix.candidates.filter((c, k) => !winnersIdx.includes(k)),
  })
  const maxScore2 = Math.max(...Object.values(nextResults))
  return winnersIdx.reduce(
    (scoreObject, winnerIdx) => ({
      ...scoreObject,
      [matrix.candidates[winnerIdx]]: maxScore2 + 1,
    }),
    nextResults,
  )
}

/**
 * #### Wikipedia: [Ranked pairs](https://en.wikipedia.org/wiki/Ranked_pairs)
 */
export class RankedPairs extends MatrixScoreMethod {
  public scores(): ScoreObject {
    return computeFromMatrix(this.matrix)
  }
}
