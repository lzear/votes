import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizBorda } from './result'

export const borda: MethodElements = {
  id: VotingSystem.Borda,
  Visualisation: VizBorda,
  data: votingTypeData.BORDA,
}
