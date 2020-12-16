import {
  SystemUsingMatrix,
  VotingSystem,
  Matrix,
  ScoreObject,
} from '../../types'
import { makeAntisymetric } from '../../utils'
import { computeLottery } from '../maximal-lotteries'

export const randomizedCondorcet: SystemUsingMatrix = {
  type: VotingSystem.RandomizedCondorcet,
  computeFromMatrix(matrix: Matrix): ScoreObject {
    const antisymetric = makeAntisymetric(matrix)
    const antisymetricUnit = {
      ...antisymetric,
      array: antisymetric.array.map((r) => r.map(Math.sign)),
    }
    return computeLottery(antisymetricUnit)
  },
}
