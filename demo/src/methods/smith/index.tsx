import type { MethodElements } from '../types'
import { VizSmith } from './viz-smith'
import { VotingSystem } from 'votes/src'
import { votingTypeData } from '../descriptions'

export const smith: MethodElements = {
  id: VotingSystem.Smith,
  Visualisation: VizSmith,
  data: votingTypeData[VotingSystem.Smith],
}
