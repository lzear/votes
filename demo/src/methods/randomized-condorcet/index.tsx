import { VotingSystem } from 'votes'

import { votingTypeData } from '../descriptions'
import type { MethodElements } from '../types'

import { VizRandomizedCondorcet } from './viz-randomized-condorcet'

export const randomizedCondorcet: MethodElements = {
  id: VotingSystem.RandomizedCondorcet,
  Visualisation: VizRandomizedCondorcet,
  data: votingTypeData[VotingSystem.RandomizedCondorcet],
}
