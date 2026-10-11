/* eslint-disable @typescript-eslint/no-non-null-assertion */

export type Edge = {
  from: number
  to: number
  /**
  Strength of the win: the winner's votes, or the margin.
  */
  value: number
  /**
  Total voters expressing a preference between these two candidates.
  */
  total: number
}

/**
Locks each group of edges in turn, dropping an edge that lies on a cycle of
the locked edges plus its whole group. Returns whether each edge, out of `n`
candidates, locks.
*/
export const lockEdges = (n: number, groups: Edge[][]): boolean[][] => {
  // One bitset row per candidate: the candidates it reaches.
  const words = Math.ceil(n / 32)
  const reaches = (reach: Uint32Array, from: number, to: number) =>
    ((reach[from * words + (to >>> 5)]! >>> (to & 31)) & 1) === 1
  // Whoever reaches `from`, or is it, now reaches `to` and all it reaches.
  const link = (reach: Uint32Array, from: number, to: number) => {
    for (let x = 0; x < n; x++)
      if (x === from || reaches(reach, x, from)) {
        reach[x * words + (to >>> 5)]! |= 1 << (to & 31)
        for (let w = 0; w < words; w++)
          reach[x * words + w]! |= reach[to * words + w]!
      }
  }

  const reach = new Uint32Array(n * words)
  return groups.map((group) => {
    // An edge is on a cycle when its head reaches back to its tail.
    const withGroup = group.length > 1 ? new Uint32Array(reach) : reach
    if (group.length > 1) for (const e of group) link(withGroup, e.from, e.to)
    return group.map((e) => {
      const locked = !reaches(withGroup, e.to, e.from)
      if (locked) link(reach, e.from, e.to)
      return locked
    })
  })
}
