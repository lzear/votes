import { MethodElements } from '../types'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'
import { VizNanson } from './result'

export const nanson: MethodElements = {
  id: VotingSystem.Nanson,
  Visualisation: VizNanson,
  data: votingTypeData[VotingSystem.Nanson],
}
