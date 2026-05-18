/* eslint-disable @typescript-eslint/no-non-null-assertion */
type SkewSymmetricMatrix = number[][]

const isZero = (matrix: number[][]): boolean => {
  for (const row of matrix) for (const val of row) if (val !== 0) return false
  return true
}

const normalizeVector = (vector: number[]): number[] => {
  const positive = vector.map((v) => Math.max(v, 0))
  const sum = positive.reduce((acc, cur) => acc + cur, 0)
  if (sum === 0) return vector.map(() => 1 / vector.length)
  return positive.map((v) => v / sum)
}

const initTableau = (n: number, cols: number, A: number[][]): number[][] => {
  const tab = Array.from({ length: n + 1 }, () =>
    Array.from({ length: cols }, () => 0),
  )
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) tab[i]![j] = A[i]![j]!
    tab[i]![n + i] = 1
    tab[i]![cols - 1] = 1
  }
  for (let j = 0; j < n; j++) tab[n]![j] = -1
  return tab
}

const findEntering = (tab: number[][], n: number): number => {
  let enterCol = -1
  let minCost = -1e-10
  for (let j = 0; j < 2 * n; j++)
    if (tab[n]![j]! < minCost) {
      minCost = tab[n]![j]!
      enterCol = j
    }
  return enterCol
}

const findLeaving = (
  tab: number[][],
  n: number,
  cols: number,
  enterCol: number,
): number => {
  let leaveRow = -1
  let minRatio = Infinity
  for (let i = 0; i < n; i++)
    if (tab[i]![enterCol]! > 1e-10) {
      const ratio = tab[i]![cols - 1]! / tab[i]![enterCol]!
      if (ratio < minRatio) {
        minRatio = ratio
        leaveRow = i
      }
    }
  return leaveRow
}

const pivotStep = (
  tab: number[][],
  n: number,
  cols: number,
  leaveRow: number,
  enterCol: number,
): void => {
  const pivotVal = tab[leaveRow]![enterCol]!
  for (let j = 0; j < cols; j++) tab[leaveRow]![j]! /= pivotVal
  for (let i = 0; i <= n; i++)
    if (i !== leaveRow && Math.abs(tab[i]![enterCol]!) > 1e-12) {
      const factor = tab[i]![enterCol]!
      for (let j = 0; j < cols; j++) tab[i]![j]! -= factor * tab[leaveRow]![j]!
    }
}

// Solves: maximize sum(y) s.t. A*y <= 1, y >= 0
const solveLP = (A: number[][]): number[] => {
  const n = A.length
  const cols = 2 * n + 1
  const tab = initTableau(n, cols, A)
  const basis = Array.from({ length: n }, (_, i) => n + i)

  for (let iter = 0; iter < 10 * (2 * n + 1); iter++) {
    const enterCol = findEntering(tab, n)
    if (enterCol === -1) break
    const leaveRow = findLeaving(tab, n, cols, enterCol)
    if (leaveRow === -1) break
    basis[leaveRow] = enterCol
    pivotStep(tab, n, cols, leaveRow, enterCol)
  }

  const y = Array.from({ length: n }, () => 0)
  for (let i = 0; i < n; i++)
    if (basis[i]! < n) y[basis[i]!] = tab[i]![cols - 1]!
  return y
}

export const findNashEquilibrium = (matrix: SkewSymmetricMatrix): number[] => {
  if (isZero(matrix)) return matrix.map(() => 1 / matrix.length)

  let maxAbs = 0
  for (const row of matrix)
    for (const v of row) if (Math.abs(v) > maxAbs) maxAbs = Math.abs(v)
  const K = maxAbs + 1
  const B = matrix.map((row) => row.map((v) => v + K))

  return normalizeVector(solveLP(B))
}
