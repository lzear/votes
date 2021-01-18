import { groupBy, range, uniq, zipObject } from 'lodash-es'
import {
  Matrix,
  ScoreObject,
  SystemUsingMatrix,
  VotingSystem,
} from '../../types'
import { Tarjan } from './Tarjan'
import { Vertex } from './Vertex'

type Edge = { from: number; to: number; value: number }

const generateAcyclicGraph = (graph: Edge[], edgesToAdd: Edge[]): Edge[] => {
  const allEdges = [...graph, ...edgesToAdd]
  const vDict = {} as { [i: number]: Vertex }
  uniq(allEdges.flatMap((e) => [e.from, e.to])).forEach(
    (c) => (vDict[c] = new Vertex(c)),
  )
  allEdges.forEach((e) => vDict[e.from].connect(vDict[e.to]))
  const tarjan = new Tarjan(Object.values(vDict))
  tarjan.run()
  return [
    ...graph,
    ...edgesToAdd.filter(
      (edge) => vDict[edge.from].lowlink !== vDict[edge.to].lowlink,
    ),
  ]
}
export const rankedPairs: SystemUsingMatrix = {
  type: VotingSystem.RankedPairs,
  computeFromMatrix(matrix: Matrix): ScoreObject {
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
        Array(matrix.candidates.length).fill(1),
      )
    const nextResults = rankedPairs.computeFromMatrix({
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
  },
}
