import range from 'lodash/range'
import zipObject from 'lodash/zipObject'
import {
  SystemUsingMatrix,
  VotingSystem,
  Matrix,
  ScoreObject,
} from '../../types'

type Edge = { from: number; to: number; value: number }

export const rankedPairs: SystemUsingMatrix = {
  type: VotingSystem.RankedPairs,
  computeFromMatrix(matrix: Matrix): ScoreObject {
    const allEdges: Edge[] = matrix.array
      .flatMap(
        (row, from) =>
          row
            .map((value, to) =>
              value > 0 && to !== from ? { from, to, value } : null,
            )
            .filter(Boolean) as Edge[],
      )
      .sort((a, b) => b.value - a.value)
    const acyclicGraph = allEdges.reduce((graph, edgeToAdd) => {
      const active: number[] = []
      const visited: number[] = []
      let cur: number | undefined = edgeToAdd.to
      while (cur !== undefined) {
        visited.push(cur)
        for (const { to } of graph.filter(({ from }) => from === cur)) {
          if (to === edgeToAdd.from) return graph
          if (!visited.includes(to) && !active.includes(to)) active.push(to)
        }
        cur = active.pop()
      }
      return [...graph, edgeToAdd]
    }, [] as Edge[])

    const winnersIdx = range(matrix.candidates.length).filter(
      (candidate, key) => !acyclicGraph.some(({ to }) => to === key),
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
    const maxScore = Math.max(...Object.values(nextResults))
    return winnersIdx.reduce(
      (scoreObject, winnerIdx) => ({
        ...scoreObject,
        [matrix.candidates[winnerIdx]]: maxScore + 1,
      }),
      nextResults,
    )
  },
}
