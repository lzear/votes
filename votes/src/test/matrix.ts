import { range } from 'lodash-es'

export const product = (a: number[][], b: number[][]): number[][] => {
  const dimA = [a.length, a[0].length]
  const dimB = [b.length, b[0].length]
  if (dimA[1] !== dimB[0])
    throw new Error(
      `Dimensions invalid for product: ${dimA[0]}x${dimA[1]} * ${dimB[0]}x${dimB[1]}`,
    )
  return a.map((aRow) =>
    range(dimB[1]).map((colIdx) =>
      aRow.reduce((acc, aVal, aCol) => acc + aVal * b[aCol][colIdx], 0),
    ),
  )
}

export const productVectM = (a: number[], b: number[][]): number[] => {
  const matA = [a]
  const p = product(matA, b)
  return p[0]
}
