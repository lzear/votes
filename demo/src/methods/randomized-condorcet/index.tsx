import { MethodElements } from '../types'
import { VizRandomizedCondorcet } from './viz-randomized-condorcet'
import { VotingSystem } from 'votes/src'
import { votingTypeData } from '../descriptions'

export const randomizedCondorcet: MethodElements = {
  id: VotingSystem.RandomizedCondorcet,
  Visualisation: VizRandomizedCondorcet,
  data: votingTypeData[VotingSystem.RandomizedCondorcet],
}
