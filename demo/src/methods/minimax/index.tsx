import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizMinimax } from './viz-minimax'

export const minimax: MethodElements = {
  id: VotingSystem.Minimax,
  Visualisation: VizMinimax,
  data: votingTypeData[VotingSystem.Minimax],
}
