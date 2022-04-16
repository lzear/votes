import { MethodElements } from '../types'
import { VizCopeland } from './viz-copeland'
import { VotingSystem } from 'votes/src'
import { votingTypeData } from '../descriptions'

export const copeland: MethodElements = {
  id: VotingSystem.Copeland,
  Visualisation: VizCopeland,
  data: votingTypeData.COPELAND,
}
