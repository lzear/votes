// From chadhutchins:
// https://gist.github.com/chadhutchins/1440602

import { Vertex } from './Vertex'

export class VertexStack {
  public vertices: Vertex[]

  constructor() {
    this.vertices = []
  }

  public contains(vertex: Vertex): boolean {
    for (const i in this.vertices)
      if (this.vertices[i].equals(vertex)) return true
    return false
  }
}
