import { MethodElements } from '../types'
import { VizInstantRunoff } from './viz-instant-runoff'
import { VotingSystem } from 'votes/src'
import { votingTypeData } from '../descriptions'

export const instantRunoff: MethodElements = {
  id: VotingSystem.InstantRunoff,
  Visualisation: VizInstantRunoff,
  data: votingTypeData.INSTANT_RUNOFF,
}
