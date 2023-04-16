import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizCoombs } from './viz-coombs'

export const coombs: MethodElements = {
  id: VotingSystem.Coombs,
  Visualisation: VizCoombs,
  data: votingTypeData[VotingSystem.Coombs],
}
