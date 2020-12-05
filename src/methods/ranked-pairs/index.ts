import concat from 'lodash/concat'
import flatten from 'lodash/flatten'
import groupBy from 'lodash/groupBy'
import range from 'lodash/range'
import without from 'lodash/without'
import zipObject from 'lodash/zipObject'
import {
  Matrix,
  ScoreObject,
  SystemUsingMatrix,
  VotingSystem,
} from '../../types'

type Edge = { from: number; to: number; value: number }

const findGraphRoots = (graph: Edge[]) => {
  const { sources } = graph.reduce(
    ({ sources, targets }, { from, to }) => ({
      sources: concat(
        without(sources, to),
        targets.includes(from) || sources.includes(from) ? [] : [from],
      ),
      targets: targets.includes(to) ? targets : [...targets, to],
    }),
    { sources: [] as number[], targets: [] as number[] },
  )
  return sources
}

const canAddEdgeToAcyclicGraph = (graph: Edge[], toAdd: Edge) => {
  const active: number[] = []
  const visited: number[] = []
  let cur: number | undefined = toAdd.to
  while (cur !== undefined) {
    visited.push(cur)
    for (const { to } of graph.filter(({ from }) => from === cur)) {
      if (to === toAdd.from) return false
      if (!visited.includes(to) && !active.includes(to)) active.push(to)
    }
    cur = active.pop()
  }
  return true
}

const graphSignature = (graph: Edge[]) =>
  graph
    .sort((a, b) => b.from - a.from || b.to - a.to)
    .map((edge) => `${edge.from}-${edge.to}`)
    .join(';')

const dedupe = (graphs: Edge[][]) =>
  graphs.reduce(
    (acc, graph) => {
      const signature = graphSignature(graph)
      if (acc.signatures.includes(signature)) return acc
      return {
        deduped: [...acc.deduped, graph],
        signatures: [...acc.signatures, signature],
      }
    },
    { deduped: [], signatures: [] } as {
      deduped: Edge[][]
      signatures: string[]
    },
  ).deduped

const generateAcyclicGraphs = (graph: Edge[], edgesToAdd: Edge[]): Edge[][] => {
  const validEdgesToAdd = edgesToAdd.filter((toAdd) =>
    canAddEdgeToAcyclicGraph(graph, toAdd),
  )
  return validEdgesToAdd.length
    ? dedupe(
        validEdgesToAdd.flatMap((toAdd, k) =>
          generateAcyclicGraphs(
            [...graph, toAdd],
            validEdgesToAdd.filter((_, kk) => kk !== k),
          ),
        ),
      )
    : [graph]
}

const sortTopEdges = (group: Edge[]): Edge[][] => {
  const sources = findGraphRoots(group)
  if (sources.length) {
    const { tops, bots } = group.reduce(
      ({ tops, bots }, cur) =>
        sources.includes(cur.from)
          ? {
              tops: [...tops, cur],
              bots,
            }
          : {
              tops,
              bots: [...bots, cur],
            },
      { tops: [] as Edge[], bots: [] as Edge[] },
    )

    if (tops.length > 0 && tops.length < group.length)
      return [tops, ...sortTopEdges(bots)]
  }
  return [group]
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
      .flatMap((value) => sortTopEdges(edgesGroups[value]))
    const acyclicGraphs = groups.reduce(
      (graphs: Edge[][], edgesToAdd) =>
        graphs.flatMap((graph) => generateAcyclicGraphs(graph, edgesToAdd)),
      [[]] as Edge[][],
    )
    const graphsWinners = acyclicGraphs.map((acyclicGraph) =>
      range(matrix.candidates.length).filter(
        (candidate, key) => !acyclicGraph.some(({ to }) => to === key),
      ),
    )

    const scores = flatten(graphsWinners).reduce((acc, curr) => {
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
    const nextRound = {
      array: matrix.array
        .filter((c, k) => !winnersIdx.includes(k))
        .map((row) => row.filter((c, k) => !winnersIdx.includes(k))),
      candidates: matrix.candidates.filter((c, k) => !winnersIdx.includes(k)),
    }

    const nextResults = rankedPairs.computeFromMatrix(nextRound)
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
