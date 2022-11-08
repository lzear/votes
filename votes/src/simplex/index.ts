export const simplexTableau = (A: number[][]): number[][] => {
  const n = A.length
  const extraZeros = new Array(n).fill(0)

  const obj: number[] = [0, ...new Array(n).fill(-1), 1, ...extraZeros, 0, 1]
  const AnZeros: number[][] = A.map((a, k) => [
    0,
    ...a.map((v) => v),
    0,
    ...extraZeros.map((v, kk) => (kk === k ? 1 : 0)),
    0,
    0,
  ])

  // set the boundary as x1 + x2 + ... + x(n-1) + 2 * xn < 1
  // cannot use the same function as the score function because
  const sum1: number[] = [1, ...new Array(n).fill(1), 0, ...extraZeros, 1, 0]

  return [obj, ...AnZeros, sum1]
}

const findPivotColumn = (T: number[][]): number | null => {
  let minValue = Infinity
  let minIndex = null
  for (let k = 1; k < T[0].length; k++) {
    const v = T[0][k]
    if (v < 0 && v < minValue && k < T[0].length - 1) {
      minValue = v
      minIndex = k
    }
  }
  return minIndex
}

export const findPivotRow = (
  T: number[][],
  col: number,
  usedRows: number[],
): number | null => {
  let minRatio = Number.POSITIVE_INFINITY
  let minIndex = null
  for (let row = 1; row < T.length; row++) {
    if (T[row][col] !== 0 && !usedRows.includes(row)) {
      const ratio = T[row][0] / T[row][col]
      if (ratio < minRatio) {
        minRatio = ratio
        minIndex = row
      }
    }
  }
  return minIndex
}

export const pivot = (
  tableau: number[][],
  col: number,
  row: number,
): number[][] => {
  const scaledRow = tableau[row].map((v) => v / tableau[row][col])
  return tableau.map((r, rowKey) =>
    rowKey === row
      ? scaledRow
      : r.map((value, colKey) => value - r[col] * scaledRow[colKey]),
  )
}

export const performPivots = (
  tableau: number[][],
  usedRows: number[],
): number[][] => {
  let pivotedTable = tableau
  let col = findPivotColumn(pivotedTable)
  while (col !== null) {
    const row = findPivotRow(pivotedTable, col, usedRows)
    if (!row) throw new Error('no row no pivot')
    usedRows.push(row)
    pivotedTable = pivot(pivotedTable, col, row)
    col = findPivotColumn(pivotedTable)
  }
  return pivotedTable
}

const vectorFromPivotedTableau = (pivotedTableau: number[][], size: number) =>
  new Array(size).fill(null).map((v, k) => {
    if (pivotedTableau[0][k + 1] === 0) {
      const row = pivotedTableau.findIndex((r) => r[k + 1] === 1)
      if (row > -1) return pivotedTableau[row][0]
    }
    return 0
  })

/**
 * * @alpha This voting system is not working correctly!
 * * @experimental This voting system is not working correctly!
 * * @deprecated This voting system is not working correctly!
 */
export const solve = (antisymetricMatrix: number[][]): number[] => {
  const tableau = simplexTableau(antisymetricMatrix)
  const usedRows = [] as number[]
  const finalPivotedTable = performPivots(tableau, usedRows)
  return vectorFromPivotedTableau(finalPivotedTable, antisymetricMatrix.length)
}
