// From chadhutchins:
// https://gist.github.com/chadhutchins/1440602

import { Vertex } from './Vertex'
import { VertexStack } from './VertexStack'

export class Tarjan {
  private index: number
  private stack: VertexStack
  private readonly graph: Vertex[]
  // scc: Vertex[][]

  constructor(graph: Vertex[]) {
    this.index = 0
    this.stack = new VertexStack()
    this.graph = graph
    // this.scc = []
  }
  public run(): void {
    for (const i in this.graph)
      if (this.graph[i].index < 0) this.strongconnect(this.graph[i])
    // return this.scc
  }
  private strongconnect(vertex: Vertex): void {
    // Set the depth index for v to the smallest unused index
    vertex.index = this.index
    vertex.lowlink = this.index
    this.index = this.index + 1
    this.stack.vertices.push(vertex)

    // Consider successors of v
    // aka... consider each vertex in vertex.connections
    for (const i in vertex.connections) {
      const v = vertex
      const w = vertex.connections[i]
      if (w.index < 0) {
        // Successor w has not yet been visited; recurse on it
        this.strongconnect(w)
        v.lowlink = Math.min(v.lowlink, w.lowlink)
      } else if (this.stack.contains(w)) {
        // Successor w is in stack S and hence in the current SCC
        v.lowlink = Math.min(v.lowlink, w.index)
      }
    }

    // If v is a root node, pop the stack and generate an SCC
    if (vertex.lowlink == vertex.index) {
      // start a new strongly connected component
      const vertices: Vertex[] = []
      let w = null
      if (this.stack.vertices.length > 0)
        do {
          w = this.stack.vertices.pop()
          // add w to current strongly connected component
          w && vertices.push(w)
        } while (w && !vertex.equals(w))
      // output the current strongly connected component
      // ... i'm going to push the results to a member scc array variable
      // if (vertices.length > 0) this.scc.push(vertices)
    }
  }
}
