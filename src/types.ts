export interface Ballot {
  ranking: string[][]
  weight: number
}
export type Rule = (rankings: Ballot[]) => string[][]

export type ScoreObject = { [candidate: string]: number }

export enum VotingSystem {
  FirstPastThePost = 'FIRST_PAST_THE_POST',
  Borda = 'BORDA',
  InstantRunoff = 'INSTANT_RUNOFF',
  TwoRoundRunoff = 'TWO_ROUND_RUNOFF',
  Kemeny = 'KEMENY',
  Approbation = 'APPROBATION',
  Schulze = 'SCHULZE',
  Minimax = 'MINIMAX',
}

export type Matrix = {
  candidates: string[]
  array: number[][]
}

export type SystemUsingRankings = {
  type: VotingSystem
  computeFromBallots(ballots: Ballot[], candidates: string[]): ScoreObject
}

export type SystemUsingMatrix = {
  type: VotingSystem
  computeFromMatrix(matrix: Matrix): ScoreObject
}

export type System = SystemUsingRankings | SystemUsingMatrix
