/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { uniq } from 'lodash-es'
import { Tarjan } from './tarjan'
import { Vertex } from './vertex'

interface Edge {
  from: number
  to: number
  value: number
}

export const generateAcyclicGraph = (
  graph: Edge[],
  edgesToAdd: Edge[],
): Edge[] => {
  const allEdges = [...graph, ...edgesToAdd]
  const vDict = {} as Record<number, Vertex>
  for (const c of uniq(allEdges.flatMap((e) => [e.from, e.to])))
    vDict[c] = new Vertex(c)

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
