import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizMinimaxTD } from './viz-minimax-td'

export const minimaxTD: MethodElements = {
  id: VotingSystem.MinimaxTD,
  Visualisation: VizMinimaxTD,
  data: votingTypeData[VotingSystem.MinimaxTD],
}
