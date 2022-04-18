import { MethodElements } from '../types'
import { VizMinimax } from './viz-minimax'
import { VotingSystem } from 'votes/src'
import { votingTypeData } from '../descriptions'

export const minimax: MethodElements = {
  id: VotingSystem.Minimax,
  Visualisation: VizMinimax,
  data: votingTypeData[VotingSystem.Minimax],
}
