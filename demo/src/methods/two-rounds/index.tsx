import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizTwoRoundsRunoff } from './viz-two-round-runoff'

export const twoRoundsRunoff: MethodElements = {
  id: VotingSystem.TwoRoundRunoff,
  Visualisation: VizTwoRoundsRunoff,
  data: votingTypeData.TWO_ROUND_RUNOFF,
}
