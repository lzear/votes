import { MethodElements } from '../types'
import { VizSchulze } from './viz-schulze'
import { VotingSystem } from 'votes'
import { votingTypeData } from '../descriptions'

export const schulze: MethodElements = {
  id: VotingSystem.Schulze,
  Visualisation: VizSchulze,
  data: votingTypeData[VotingSystem.Schulze],
}
