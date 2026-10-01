export interface Edge {
  from: number
  to: number
  value: number
  // Total voters expressing a preference between these two candidates.
  total: number
}

const reaches = (edges: Edge[], from: number, to: number): boolean => {
  const seen = new Set([from])
  const stack = [from]
  for (let v = stack.pop(); v !== undefined; v = stack.pop()) {
    if (v === to) return true
    for (const e of edges)
      if (e.from === v && !seen.has(e.to)) {
        seen.add(e.to)
        stack.push(e.to)
      }
  }
  return false
}

/**
 * Locks `edgesToAdd` simultaneously: an edge is dropped when it lies on a cycle
 * of the locked graph plus the whole group.
 */
export const generateAcyclicGraph = (
  graph: Edge[],
  edgesToAdd: Edge[],
): Edge[] => {
  const all = [...graph, ...edgesToAdd]
  return [...graph, ...edgesToAdd.filter((e) => !reaches(all, e.to, e.from))]
}
