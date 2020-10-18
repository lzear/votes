import borda from './methods/borda'
import approbation from './methods/approbation'
import firstPastThePost from './methods/first-past-the-post'
import instantRunoff from './methods/instant-runoff'
import kemeny from './methods/kemeny'
import schulze from './methods/schulze'
import minimax from './methods/minimax'
import twoRoundRunoff from './methods/two-round-runoff'
import {
  System,
  VotingSystem,
  SystemUsingRankings,
  SystemUsingMatrix,
  Matrix,
  ScoreObject,
  Ballot,
} from './types'
import * as utils from './utils'

const methods = {
  [VotingSystem.FirstPastThePost]: firstPastThePost,
  [VotingSystem.Approbation]: approbation,
  [VotingSystem.Borda]: borda,
  [VotingSystem.Kemeny]: kemeny,
  [VotingSystem.InstantRunoff]: instantRunoff,
  [VotingSystem.TwoRoundRunoff]: twoRoundRunoff,
  [VotingSystem.Schulze]: schulze,
  [VotingSystem.Minimax]: minimax,
}

export {
  methods,
  VotingSystem,
  System,
  SystemUsingRankings,
  SystemUsingMatrix,
  Matrix,
  ScoreObject,
  Ballot,
  utils,
}
