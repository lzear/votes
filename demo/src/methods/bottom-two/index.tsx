import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizBottomTwo } from './viz-bottom-two'

export const bottomTwo: MethodElements = {
  id: VotingSystem.BottomTwoRunoff,
  Visualisation: VizBottomTwo,
  data: votingTypeData[VotingSystem.BottomTwoRunoff],
}
