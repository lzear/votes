import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizInstantRunoff } from './viz-instant-runoff'

export const instantRunoff: MethodElements = {
  id: VotingSystem.InstantRunoff,
  Visualisation: VizInstantRunoff,
  data: votingTypeData.INSTANT_RUNOFF,
}
