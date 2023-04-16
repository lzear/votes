import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizCopeland } from './viz-copeland'

export const copeland: MethodElements = {
  id: VotingSystem.Copeland,
  Visualisation: VizCopeland,
  data: votingTypeData.COPELAND,
}
