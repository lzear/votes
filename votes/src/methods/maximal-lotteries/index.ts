import zipObject from 'lodash/zipObject'
import { solve } from '../../simplex'
import { Matrix, ScoreObject } from '../../types'
import { findCondorcet } from '../../utils/condorcet'
import { makeAntisymetric } from '../../utils'
import { scoresZero } from '../../utils/scores-zero'
import { RandomMatrixMethod } from '../../classes/random-matrix-method'

export const computeLottery = (
  _matrix: Matrix,
): { [candidate: string]: number } => {
  const matrix = makeAntisymetric(_matrix)
  const condorset = findCondorcet(matrix)

  const subVector = solve(condorset.array).map((v) => Math.max(0, v))

  // Fixups because I can't implement the simplex algorithm correctly
  //  ---------- Begin ----------
  const sum = subVector.reduce((acc, cur) => acc + cur, 0)
  const normalizedVector = subVector.map((v) => v / sum)
  //  ----------  End  ----------

  return {
    ...scoresZero(matrix.candidates),
    ...zipObject(condorset.candidates, normalizedVector),
  }
}

export class MaximalLotteries extends RandomMatrixMethod {
  public scores(): ScoreObject {
    return computeLottery(this.matrix)
  }
}
