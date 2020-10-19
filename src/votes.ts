import approbation from './methods/approbation'
import borda from './methods/borda'
import copeland from './methods/copeland'
import firstPastThePost from './methods/first-past-the-post'
import instantRunoff from './methods/instant-runoff'
import kemeny from './methods/kemeny'
import minimax from './methods/minimax'
import schulze from './methods/schulze'
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
  [VotingSystem.Approbation]: approbation,
  [VotingSystem.Borda]: borda,
  [VotingSystem.Copeland]: copeland,
  [VotingSystem.FirstPastThePost]: firstPastThePost,
  [VotingSystem.InstantRunoff]: instantRunoff,
  [VotingSystem.Kemeny]: kemeny,
  [VotingSystem.Minimax]: minimax,
  [VotingSystem.Schulze]: schulze,
  [VotingSystem.TwoRoundRunoff]: twoRoundRunoff,
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
