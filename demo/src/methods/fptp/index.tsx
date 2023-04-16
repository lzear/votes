import { MethodElements } from '../types'
import { VizFptp } from './viz-fptp'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'

export const fptp: MethodElements = {
  id: VotingSystem.FirstPastThePost,
  Visualisation: VizFptp,
  data: votingTypeData.FIRST_PAST_THE_POST,
}
