/* eslint-disable @typescript-eslint/no-non-null-assertion */

type SkewSymmetricMatrix = readonly (readonly number[])[]

const abs = (v: bigint): bigint => (v < 0n ? -v : v)

// The column to bring in: the most negative reduced cost, or with `bland`,
// the first negative one.
const entering = (cost: bigint[], bland: boolean): number => {
  let c = -1
  for (const [j, v] of cost.entries()) {
    if (v >= 0n || (c !== -1 && v >= cost[c]!)) continue
    if (bland) return j
    c = j
  }
  return c
}

// The row to pivot on: the smallest ratio, ties going to the lowest basic
// column.
const leaving = (tab: bigint[][], basis: number[], c: number): number => {
  const rhs = tab[0]!.length - 1
  let r = -1
  for (const [i, row] of tab.slice(0, basis.length).entries()) {
    if (row[c]! <= 0n) continue
    const x = r === -1 ? -1n : row[rhs]! * tab[r]![c]! - tab[r]![rhs]! * row[c]!
    if (x < 0n || (x === 0n && basis[i]! < basis[r]!)) r = i
  }
  return r
}

// Pivots on `tab[r][c]`, fraction-free: each entry is an integer, its value
// times `d`, the last pivot. Returns the new `d`.
const pivotOn = (tab: bigint[][], r: number, c: number, d: bigint): bigint => {
  const pivot = tab[r]![c]!
  for (const [i, row] of tab.entries()) {
    if (i === r) continue
    const f = row[c]!
    for (const [j, v] of row.entries())
      row[j] = (v * pivot - f * tab[r]![j]!) / d
  }
  return pivot
}

// Solves max Σy s.t. By ≤ 1, y ≥ 0, for B = A + K > 0, and returns y / Σy.
// Exactly: on degenerate games, a float tableau can cycle or stall. Dantzig's
// rule, then Bland's, which cannot cycle, once that runs long.
const solveLP = (A: SkewSymmetricMatrix): number[] => {
  const n = A.length
  // Integers: as they are, or on the 1e-6 tie tolerance grid.
  const scale = A.flat().every((v) => Number.isSafeInteger(v)) ? 1 : 1e6
  const S = A.map((row) => row.map((v) => BigInt(Math.round(v * scale))))
  let K = 1n
  for (const v of S.flat()) if (abs(v) >= K) K = abs(v) + 1n
  const tab = S.map((row, i) => [
    ...row.map((v) => v + K),
    ...row.map((_, j) => (i === j ? 1n : 0n)),
    1n,
  ])
  const cost = [...S.map(() => -1n), ...S.map(() => 0n), 0n]
  tab.push(cost)
  const basis = S.map((_, i) => n + i)
  let d = 1n

  for (let iter = 0; ; iter++) {
    const c = entering(cost.slice(0, -1), iter >= 10 * (2 * n + 1))
    if (c === -1) break
    const r = leaving(tab, basis, c)
    d = pivotOn(tab, r, c, d)
    basis[r] = c
  }

  const y = S.map(() => 0n)
  for (const [i, b] of basis.entries()) if (b < n) y[b] = tab[i]!.at(-1)!
  let total = 0n
  for (const v of y) total += v
  return y.map((v) => Number((v << 64n) / total) / 2 ** 64)
}

export const findNashEquilibrium = (matrix: SkewSymmetricMatrix): number[] =>
  matrix.every((row) => row.every((v) => v === 0))
    ? matrix.map(() => 1 / matrix.length)
    : solveLP(matrix)
