import { MethodElements } from '../types'
import { VizMaximalLotteries } from './viz-maximal-lotteries'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'

export const maximalLotteries: MethodElements = {
  id: VotingSystem.MaximalLotteries,
  Visualisation: VizMaximalLotteries,
  data: votingTypeData[VotingSystem.MaximalLotteries],
}
