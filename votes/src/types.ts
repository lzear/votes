export type Ballot<C extends string> = {
  ranking: readonly (readonly C[])[]
  /**
  How many voters cast it (default 1): finite, not negative.
  */
  weight?: number
}

export type Matrix<C extends string> = {
  candidates: readonly C[]
  array: readonly (readonly number[])[]
}

/**
What every method takes.
*/
export type Profile<C extends string> = {
  candidates: readonly C[]
  ballots: readonly Ballot<C>[]
  /**
  Whether candidates a ballot leaves unranked are appended to it as one
  tied bottom tier (default true — the classic "pessimistic" completion
  of partial ballots). Pass false to score only what voters expressed:
  unranked candidates then earn nothing from that ballot (no Borda
  points, no transfers, no last-place counts, no pairwise wins).
  */
  unrankedLast?: boolean
  /**
  Whether blank ballots, ranking none of the candidates still in the race,
  count as cast (default false): toward absolute majorities and, with
  `unrankedLast`, as worst grades in majority judgment.
  */
  countBlank?: boolean
}

export type ScoreObject<C extends string> = Record<C, number>

/**
Candidates in tiers, best first: each tier lists candidates tied together.
A copy of one can be changed: results are readonly, and cached ones frozen.
*/
export type Ranking<C extends string> = readonly (readonly C[])[]

/**
Trace of one tiebreaker's work within a round.
*/
export type TieBreakStep<C extends string> = {
  /**
  Position among the round's tiebreakers: the method's built-in ones, then
  the `Election` methods after it.
  */
  readonly index: number
  /**
  The tiebreaker's label: its `with()` option, or its class's.
  */
  readonly name: string
  /**
  Candidates that were tied going into this step.
  */
  readonly candidates: readonly C[]
  /**
  Full ranking produced by the tiebreaker on `candidates`.
  */
  readonly ranking: Ranking<C>
  /**
  Scores produced by the tiebreaker (when the method supports scores()).
  */
  readonly scores?: Readonly<Partial<Record<C, number>>>
  /**
  Candidates promoted out of the tie (upper tiers of `ranking`).
  */
  readonly resolved: readonly C[]
  /**
  Candidates still tied after this step (last tier of `ranking`).
  */
  readonly remaining: readonly C[]
}

export type QE<C extends string, I = undefined> = {
  /**
  Candidates still in the race after this round. In the last, the winners:
  several when it stops on a tie whose order decides who wins, those who
  win in some order of breaking it.
  */
  readonly qualified: readonly C[]
  readonly eliminated: readonly C[]
  readonly scores: Readonly<ScoreObject<C>>
  readonly tieBreakSteps?: readonly TieBreakStep<C>[]
  /**
  Method-specific detail about this round
  */
  readonly info?: I
}

export type Round<C extends string, I = undefined> = {
  readonly index: number
  /**
  Candidates still in the race.
  */
  readonly candidates: readonly C[]
} & QE<C, I>

export const VotingSystem = {
  Approval: 'APPROVAL',
  AbsoluteMajority: 'ABSOLUTE_MAJORITY',
  AntiPlurality: 'ANTI_PLURALITY',
  Baldwin: 'BALDWIN',
  Benham: 'BENHAM',
  Black: 'BLACK',
  Borda: 'BORDA',
  BottomTwoRunoff: 'BOTTOM_TWO_RUNOFF',
  Bucklin: 'BUCKLIN',
  CandidateOrder: 'CANDIDATE_ORDER',
  Coombs: 'COOMBS',
  Copeland: 'COPELAND',
  Dictator: 'DICTATOR',
  FirstPastThePost: 'FIRST_PAST_THE_POST',
  Kemeny: 'KEMENY',
  InstantRunoff: 'INSTANT_RUNOFF',
  MajorityJudgment: 'MAJORITY_JUDGMENT',
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
  SmithInstantRunoff: 'SMITH_INSTANT_RUNOFF',
  SplitCycle: 'SPLIT_CYCLE',
  StableVoting: 'STABLE_VOTING',
  SupplementaryVote: 'SUPPLEMENTARY_VOTE',
  TidemanAlternative: 'TIDEMAN_ALTERNATIVE',
  TwoRoundRunoff: 'TWO_ROUND_RUNOFF',
  Woodall: 'WOODALL',
} as const
export type VotingSystem = (typeof VotingSystem)[keyof typeof VotingSystem]
