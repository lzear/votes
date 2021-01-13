import zipObject from 'lodash-es/zipObject'
import range from 'lodash-es/range'
import {
  SystemUsingMatrix,
  VotingSystem,
  Matrix,
  ScoreObject,
} from '../../types'

const rankingPenalty = (ranking: number[], matrix: number[][]) => {
  let p = 0
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = i + 1; j < matrix.length; j += 1) {
      p += matrix[ranking[i]][ranking[j]]
    }
  }
  return p
}

const nextPermutation = (arr: number[]) => {
  // Find longest non-increasing suffix
  const array = [...arr]
  let i = array.length - 1
  while (i > 0 && array[i - 1] >= array[i]) i -= 1
  // Now i is the head index of the suffix

  // Are we at the last permutation already?
  if (i <= 0) return false

  // Let array[i - 1] be the pivot
  // Find rightmost element that exceeds the pivot
  let j = array.length - 1
  while (array[j] <= array[i - 1]) j -= 1
  // Now the value array[j] will become the new pivot
  // Assertion: j >= i

  // Swap the pivot with j
  let temp = array[i - 1]
  array[i - 1] = array[j]
  array[j] = temp

  // Reverse the suffix
  j = array.length - 1
  while (i < j) {
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
    i += 1
    j -= 1
  }

  // Successfully computed the next permutation
  return array
}

export const kemeny: SystemUsingMatrix = {
  type: VotingSystem.Kemeny,
  computeFromMatrix(matrix: Matrix): ScoreObject {
    let bestPermutations: number[][] = []
    let bestScore = Infinity
    let p: number[] | false = range(matrix.candidates.length)
    while (p) {
      const s = rankingPenalty(p, matrix.array)
      if (s === bestScore) bestPermutations.push(p)
      else if (s < bestScore) {
        bestScore = s
        bestPermutations = [p]
      }
      p = nextPermutation(p)
    }
    const sumIdx = matrix.candidates.map((c, cIdx) =>
      bestPermutations
        .map((perm) => perm.indexOf(cIdx))
        .reduce((a, v) => a + v, 0),
    )
    return zipObject(matrix.candidates, sumIdx)
  },
}
