export interface Ballot<C extends string> {
  ranking: C[][]
  weight: number
}

export interface Matrix<C extends string> {
  candidates: C[]
  array: number[][]
}

export type ScoreObject<C extends string> = Record<C, number>

export enum VotingSystem {
  Approbation = 'APPROBATION',
  AbsoluteMajority = 'ABSOLUTE_MAJORITY',
  Baldwin = 'BALDWIN',
  Borda = 'BORDA',
  BottomTwoRunoff = 'BOTTOM_TWO_RUNOFF',
  Coombs = 'COOMBS',
  Copeland = 'COPELAND',
  FirstPastThePost = 'FIRST_PAST_THE_POST',
  Kemeny = 'KEMENY',
  InstantRunoff = 'INSTANT_RUNOFF',
  MajorityJudgment = 'MAJORITY_JUDGEMENT',
  MaximalLotteries = 'MAXIMAL_LOTTERIES',
  Minimax = 'MINIMAX',
  MinimaxTD = 'MINIMAX_TD',
  Nanson = 'NANSON',
  RandomizedCondorcet = 'RANDOMIZED_CONDORCET',
  RandomCandidates = 'RANDOM_CANDIDATES',
  RandomDictator = 'RANDOM_DICTATOR',
  RankedPairs = 'RANKED_PAIRS',
  Schulze = 'SCHULZE',
  Smith = 'SMITH',
  TwoRoundRunoff = 'TWO_ROUND_RUNOFF',
}
