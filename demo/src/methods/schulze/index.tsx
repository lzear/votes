import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizSchulze } from './viz-schulze'

export const schulze: MethodElements = {
  id: VotingSystem.Schulze,
  Visualisation: VizSchulze,
  data: votingTypeData[VotingSystem.Schulze],
}
