export interface Ballot {
  ranking: string[][]
  weight: number
}
export type Rule = (rankings: Ballot[]) => string[][]

export type ScoreObject = { [candidate: string]: number }

export enum VotingSystem {
  Approbation = 'APPROBATION',
  Borda = 'BORDA',
  Copeland = 'COPELAND',
  FirstPastThePost = 'FIRST_PAST_THE_POST',
  Kemeny = 'KEMENY',
  InstantRunoff = 'INSTANT_RUNOFF',
  Minimax = 'MINIMAX',
  Schulze = 'SCHULZE',
  TwoRoundRunoff = 'TWO_ROUND_RUNOFF',
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
