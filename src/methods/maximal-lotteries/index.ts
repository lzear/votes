import { zipObject } from 'lodash-es'
import { solve } from '../../simplex'
import {
  SystemUsingMatrix,
  VotingSystem,
  Matrix,
  ScoreObject,
} from '../../types'
import { makeAntisymetric } from '../../utils/makeMatrix'
import { findCondorcet } from '../../utils/condorcet'

export const computeLottery = (
  matrix: Matrix,
): { [candidate: string]: number } => {
  const condorset = findCondorcet(matrix)

  const subVector = solve(condorset.array).map((v) => Math.max(0, v))

  // Fixups because I can't implement the simplex algorithm correctly
  //  ---------- Begin ----------
  const sum = subVector.reduce((acc, cur) => acc + cur, 0)
  const normalizedVector = subVector.map((v) => v / sum)
  //  ----------  End  ----------

  return matrix.candidates
    .filter((candidate) => !condorset.candidates.includes(candidate))
    .reduce(
      (acc, cur) => ({ [cur]: 0, ...acc }),
      zipObject(condorset.candidates, normalizedVector),
    )
}

export const maximalLotteries: SystemUsingMatrix = {
  type: VotingSystem.MaximalLotteries,
  computeFromMatrix(matrix: Matrix): ScoreObject {
    return computeLottery(makeAntisymetric(matrix))
  },
}
