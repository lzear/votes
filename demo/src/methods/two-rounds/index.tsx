import { MethodElements } from '../types'
import { VizTwoRoundsRunoff } from './viz-two-round-runoff'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'

export const twoRoundsRunoff: MethodElements = {
  id: VotingSystem.TwoRoundRunoff,
  Visualisation: VizTwoRoundsRunoff,
  data: votingTypeData.TWO_ROUND_RUNOFF,
}
