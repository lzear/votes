import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizRankedPairs } from './viz-ranked-pairs'

export const rankedPairs: MethodElements = {
  id: VotingSystem.RankedPairs,
  Visualisation: VizRankedPairs,
  data: votingTypeData[VotingSystem.RankedPairs],
}
