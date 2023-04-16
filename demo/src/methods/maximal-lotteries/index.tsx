import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizMaximalLotteries } from './viz-maximal-lotteries'

export const maximalLotteries: MethodElements = {
  id: VotingSystem.MaximalLotteries,
  Visualisation: VizMaximalLotteries,
  data: votingTypeData[VotingSystem.MaximalLotteries],
}
