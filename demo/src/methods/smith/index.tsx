import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizSmith } from './viz-smith'

export const smith: MethodElements = {
  id: VotingSystem.Smith,
  Visualisation: VizSmith,
  data: votingTypeData[VotingSystem.Smith],
}
