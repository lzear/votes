import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizFptp } from './viz-fptp'

export const fptp: MethodElements = {
  id: VotingSystem.FirstPastThePost,
  Visualisation: VizFptp,
  data: votingTypeData.FIRST_PAST_THE_POST,
}
