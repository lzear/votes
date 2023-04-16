import { MethodElements } from '../types'
import { VizCoombs } from './viz-coombs'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'

export const coombs: MethodElements = {
  id: VotingSystem.Coombs,
  Visualisation: VizCoombs,
  data: votingTypeData[VotingSystem.Coombs],
}
