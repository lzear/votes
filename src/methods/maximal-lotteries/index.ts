import * as _ from 'lodash'
import { solve } from '../../simplex'
import {
  SystemUsingMatrix,
  VotingSystem,
  Matrix,
  ScoreObject,
} from '../../types'
import { makeAntisymetric } from '../../utils'

export const maximalLotteries: SystemUsingMatrix = {
  type: VotingSystem.MaximalLotteries,
  computeFromMatrix(matrix: Matrix): ScoreObject {
    const antisymetric = makeAntisymetric(matrix)
    const vector = solve(antisymetric.array).map((v) => Math.max(0, v))

    // Fixups because I can't implement the simplex algorithm correctly
    //  ---------- Begin ----------
    const sum = vector.reduce((acc, cur) => acc + cur, 0)
    const normalizedVector = vector.map((v) => v / sum)
    //  ----------  End  ----------

    return _.zipObject(antisymetric.candidates, normalizedVector)
  },
}
