import { VizBorda } from './result'
import { MethodElements } from '../types'
import { VotingSystem } from 'votes/src'
import { votingTypeData } from '../descriptions'

export const borda: MethodElements = {
  id: VotingSystem.Borda,
  Visualisation: VizBorda,
  data: votingTypeData.BORDA,
}
