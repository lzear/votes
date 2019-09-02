import borda from './methods/borda'
import approbation from './methods/approbation'
import majority from './methods/majority'
import runoff from './methods/runoff'
import kemeny from './methods/kemeny'
import {
  System,
  VotingSystem,
  SystemUsingRankings,
  SystemUsingMatrix,
  Matrix,
  ScoreObject
} from './types'

const methods: { [type in VotingSystem]: System } = {
  [VotingSystem.Majority]: majority,
  [VotingSystem.Approbation]: approbation,
  [VotingSystem.Borda]: borda,
  [VotingSystem.Kemeny]: kemeny,
  [VotingSystem.Runoff]: runoff
}

export default methods

export { VotingSystem, System, SystemUsingRankings, SystemUsingMatrix, Matrix, ScoreObject }
