import { MethodElements } from '../types'
import { VizBottomTwo } from './viz-bottom-two'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'

export const bottomTwo: MethodElements = {
  id: VotingSystem.BottomTwoRunoff,
  Visualisation: VizBottomTwo,
  data: votingTypeData[VotingSystem.BottomTwoRunoff],
}
