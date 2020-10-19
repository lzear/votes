import {
  SystemUsingMatrix,
  VotingSystem,
  Matrix,
  ScoreObject,
} from '../../types'

/**
 * https://en.wikipedia.org/wiki/Schulze_method
 */
const minimax: SystemUsingMatrix = {
  type: VotingSystem.Minimax,
  computeFromMatrix(matrix: Matrix): ScoreObject {
    const s: ScoreObject = {}
    matrix.candidates.forEach((c, k) => {
      s[c] = -Math.max(
        ...matrix.array[k].map((v, k2) => matrix.array[k2][k] - v),
      )
    })
    return s
  },
}
export default minimax
