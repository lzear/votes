import type { Vertex } from './vertex'

export class VertexStack {
  private readonly _vertices: Vertex[] = []
  private readonly _set = new Set<Vertex>()

  public get vertices(): readonly Vertex[] {
    return this._vertices
  }

  public push(vertex: Vertex): void {
    this._vertices.push(vertex)
    this._set.add(vertex)
  }

  public pop(): Vertex | undefined {
    const v = this._vertices.pop()
    if (v) this._set.delete(v)
    return v
  }

  public contains(vertex: Vertex): boolean {
    return this._set.has(vertex)
  }
}
