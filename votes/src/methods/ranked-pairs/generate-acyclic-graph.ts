/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Tarjan } from './tarjan'
import { Vertex } from './vertex'

export interface Edge {
  from: number
  to: number
  value: number
  // Total voters expressing a preference between these two candidates.
  total: number
}

/**
 * NB: the lowlink comparison below is NOT a strict same-SCC test — Tarjan
 * lowlinks are not canonical SCC ids, so vertices of one SCC can differ. The
 * ranked-pairs results rely on this: on raw win-count matrices (both
 * directions of a pair positive) a strict cycle check would drop nearly every
 * edge and produce a full tie. Do not "simplify" this to reachability/SCC
 * without re-deriving the expected results in ranked-pairs.test.ts.
 */
export const generateAcyclicGraph = (
  graph: Edge[],
  edgesToAdd: Edge[],
): Edge[] => {
  const allEdges = [...graph, ...edgesToAdd]
  const vDict = {} as Record<number, Vertex>
  const uniqEdges = new Set(allEdges.flatMap((e) => [e.from, e.to]))
  for (const c of uniqEdges) vDict[c] = new Vertex(c)

  for (const e of allEdges) vDict[e.from]!.connect(vDict[e.to]!)
  const tarjan = new Tarjan(Object.values(vDict))
  tarjan.run()
  return [
    ...graph,
    ...edgesToAdd.filter(
      (edge) => vDict[edge.from]!.lowlink !== vDict[edge.to]!.lowlink,
    ),
  ]
}
