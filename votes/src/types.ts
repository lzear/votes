export interface Ballot<C extends string> {
  ranking: C[][]
  // How many voters cast it (default 1).
  weight?: number
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

// Trace of one tiebreaker's work within a round.
export interface TieBreakStep<C extends string> {
  // Position among the method's tiebreakers, built-in ones first.
  index: number
  // The tiebreaker's label, or its class name.
  name: string
  // Candidates that were tied going into this step.
  candidates: C[]
  // Full ranking produced by the tiebreaker on `candidates`.
  ranking: C[][]
  // Scores produced by the tiebreaker (when the method supports scores()).
  scores?: Partial<Record<C, number>>
  // Candidates promoted out of the tie (upper tiers of `ranking`).
  resolved: C[]
  // Candidates still tied after this step (last tier of `ranking`).
  remaining: C[]
}

export interface QE<C extends string, I = undefined> {
  qualified: C[]
  eliminated: C[]
  scores: ScoreObject<C>
  tieBreakSteps?: TieBreakStep<C>[]
  // Method-specific detail about this round
  info?: I
}

export interface Round<C extends string, I = undefined> extends QE<C, I> {
  index: number
  // Candidates still in the race.
  candidates: C[]
}

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
