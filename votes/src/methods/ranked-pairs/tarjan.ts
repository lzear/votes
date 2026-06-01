// From chadhutchins:
// https://gist.github.com/chadhutchins/1440602

import type { Vertex } from './vertex'
import { VertexStack } from './vertex-stack'

export class Tarjan {
  private index = 0
  private stack: VertexStack
  private readonly graph: Vertex[]
  private readonly scc: Vertex[][]

  constructor(graph: Vertex[]) {
    this.stack = new VertexStack()
    this.graph = graph
    this.scc = []
  }

  public run(): Vertex[][] {
    for (const v of this.graph) if (v.index < 0) this.strongconnect(v)
    return this.scc
  }

  private processConnection(v: Vertex, w: Vertex): void {
    if (w.index < 0) {
      this.strongconnect(w)
      v.lowlink = Math.min(v.lowlink, w.lowlink)
    } else if (this.stack.contains(w)) v.lowlink = Math.min(v.lowlink, w.index)
  }

  private extractSCC(vertex: Vertex): void {
    const vertices: Vertex[] = []
    let w: Vertex | undefined
    if (this.stack.vertices.length > 0)
      do {
        w = this.stack.vertices.pop()
        if (w) vertices.push(w)
      } while (w && !vertex.equals(w))
    if (vertices.length > 0) this.scc.push(vertices)
  }

  private strongconnect(vertex: Vertex): void {
    vertex.index = this.index
    vertex.lowlink = this.index
    this.index = this.index + 1
    this.stack.vertices.push(vertex)

    for (const connection of vertex.connections)
      this.processConnection(vertex, connection)

    if (vertex.lowlink === vertex.index) this.extractSCC(vertex)
  }
}
