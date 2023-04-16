import { MethodElements } from '../types'
import { VizRankedPairs } from './viz-ranked-pairs'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'

export const rankedPairs: MethodElements = {
  id: VotingSystem.RankedPairs,
  Visualisation: VizRankedPairs,
  data: votingTypeData[VotingSystem.RankedPairs],
}
