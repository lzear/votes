import solver from 'javascript-lp-solver'

type SkewSymmetricMatrix = number[][]

const isZero = (matrix: number[][]): boolean => {
  for (let i = 0; i < matrix.length; i++)
    for (let j = 0; j < matrix.length; j++) if (matrix[i][j] !== 0) return false
  return true
}

const normalizeVector = (vector: number[]): number[] => {
  const positive = vector.map((v) => (v > 0 ? v : 0))
  const sum = positive.reduce((acc, cur) => acc + cur, 0)
  return positive.map((v) => v / sum)
}

export const findNashEquilibrium = (matrix: SkewSymmetricMatrix): number[] => {
  if (isZero(matrix)) return matrix.map(() => 1 / matrix.length)

  const constraints: Record<string, Record<string, number>> = {
    sum: { equal: 1 },
  }
  const variables: Record<string, Record<string, number>> = {}
  for (let i = 0; i < matrix.length; i++) {
    constraints[`p${i + 1}`] = { min: 0 }

    const variable: Record<string, number> = { v: matrix[i][0], sum: 1 }
    for (let j = 0; j < matrix.length; j++) variable[`p${j + 1}`] = matrix[i][j]
    variables[`p${i + 1}`] = variable
  }

  const model = {
    optimize: 'v',
    opType: 'min',
    constraints,
    variables,
  }

  const result = solver.Solve(model)

  const probabilities = []
  for (let i = 0; i < matrix.length; i++)
    probabilities.push(result[`p${i + 1}`] || 0)

  return normalizeVector(probabilities)
}
