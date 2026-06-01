// From chadhutchins:
// https://gist.github.com/chadhutchins/1440602

import type { Vertex } from './vertex'

export class VertexStack {
  public vertices: Vertex[]

  constructor() {
    this.vertices = []
  }

  public contains(vertex: Vertex): boolean {
    return this.vertices.some((v) => v.equals(vertex))
  }
}
