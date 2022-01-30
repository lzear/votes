export interface Ballot {
  ranking: string[][]
  weight: number
}

export type Matrix = {
  candidates: string[]
  array: number[][]
}

export type ScoreObject = Record<string, number>

export enum VotingSystem {
  Approbation = 'APPROBATION',
  AbsoluteMajority = 'ABSOLUTE_MAJORITY',
  Baldwin = 'BALDWIN',
  Borda = 'BORDA',
  Coombs = 'COOMBS',
  Copeland = 'COPELAND',
  FirstPastThePost = 'FIRST_PAST_THE_POST',
  Kemeny = 'KEMENY',
  InstantRunoff = 'INSTANT_RUNOFF',
  MaximalLotteries = 'MAXIMAL_LOTTERIES',
  Minimax = 'MINIMAX',
  Nanson = 'NANSON',
  RandomizedCondorcet = 'RANDOMIZED_CONDORCET',
  RandomCandidates = 'RANDOM_CANDIDATES',
  RandomDictator = 'RANDOM_DICTATOR',
  RankedPairs = 'RANKED_PAIRS',
  Schulze = 'SCHULZE',
  TwoRoundRunoff = 'TWO_ROUND_RUNOFF',
}
