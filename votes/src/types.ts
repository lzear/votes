export interface Ballot<C extends string> {
  ranking: C[][]
  weight: number
}

export interface Matrix<C extends string> {
  candidates: C[]
  array: number[][]
}

// What every method takes.
export interface Profile<C extends string> {
  candidates: C[]
  ballots: Ballot<C>[]
  /**
   * Whether candidates a ballot leaves unranked are appended to it as one
   * tied bottom tier (default true — the classic "pessimistic" completion
   * of partial ballots). Pass false to score only what voters expressed:
   * unranked candidates then earn nothing from that ballot (no Borda
   * points, no transfers, no last-place counts, no pairwise wins).
   */
  unrankedLast?: boolean
}

export type ScoreObject<C extends string> = Record<C, number>

export const VotingSystem = {
  Approbation: 'APPROBATION',
  AbsoluteMajority: 'ABSOLUTE_MAJORITY',
  Baldwin: 'BALDWIN',
  Borda: 'BORDA',
  BottomTwoRunoff: 'BOTTOM_TWO_RUNOFF',
  Coombs: 'COOMBS',
  Copeland: 'COPELAND',
  FirstPastThePost: 'FIRST_PAST_THE_POST',
  Kemeny: 'KEMENY',
  InstantRunoff: 'INSTANT_RUNOFF',
  MajorityJudgment: 'MAJORITY_JUDGEMENT',
  MaximalLotteries: 'MAXIMAL_LOTTERIES',
  Minimax: 'MINIMAX',
  MinimaxTD: 'MINIMAX_TD',
  Nanson: 'NANSON',
  RandomizedCondorcet: 'RANDOMIZED_CONDORCET',
  RandomCandidates: 'RANDOM_CANDIDATES',
  RandomDictator: 'RANDOM_DICTATOR',
  RankedPairs: 'RANKED_PAIRS',
  Schulze: 'SCHULZE',
  Smith: 'SMITH',
  TwoRoundRunoff: 'TWO_ROUND_RUNOFF',
} as const
export type VotingSystem = (typeof VotingSystem)[keyof typeof VotingSystem]
