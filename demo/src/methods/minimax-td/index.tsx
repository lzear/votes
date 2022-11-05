import type { MethodElements } from '../types'
import { VizMinimaxTD } from './viz-minimax-td'
import { VotingSystem } from 'votes/src'
import { votingTypeData } from '../descriptions'

export const minimaxTD: MethodElements = {
  id: VotingSystem.MinimaxTD,
  Visualisation: VizMinimaxTD,
  data: votingTypeData[VotingSystem.MinimaxTD],
}
