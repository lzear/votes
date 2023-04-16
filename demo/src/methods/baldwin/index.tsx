import { MethodElements } from '../types'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'
import { VizBaldin } from './result'

export const baldwin: MethodElements = {
  id: VotingSystem.Baldwin,
  Visualisation: VizBaldin,
  data: votingTypeData[VotingSystem.Baldwin],
}
