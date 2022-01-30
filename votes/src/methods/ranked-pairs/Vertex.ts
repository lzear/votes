// From chadhutchins:
// https://gist.github.com/chadhutchins/1440602

export class Vertex {
  public index: number
  public lowlink: number
  public connections: Vertex[]
  private readonly name: number | string
  constructor(name: number | string) {
    this.connections = []
    this.name = name

    // used in tarjan algorithm
    // went ahead and explicity initalized them
    this.index = -1
    this.lowlink = -1
  }

  public equals(vertex: Vertex): boolean {
    // equality check based on vertex name
    return this.name == vertex.name
  }

  public connect(vertex: Vertex): void {
    this.connections.push(vertex)
  }
}
