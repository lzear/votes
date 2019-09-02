export interface WeightedBallot {
  ranking: Ballot
  weight: number
}

export type Ballot = string[][]

export type Rule = (rankings: WeightedBallot[]) => string[][]

export type ScoreObject = { [candidate: string]: number }

export enum VotingSystem {
  Majority = 'MAJORITY',
  Borda = 'BORDA',
  Runoff = 'RUNOFF',
  Kemeny = 'KEMENY',
  Approbation = 'APPROBATION'
}

export type Matrix = {
  candidates: string[]
  array: number[][]
}

export type SystemUsingRankings = {
  type: VotingSystem
  computeScoresFromRankings(candidates: string[], rankings: Ballot[]): ScoreObject
}

export type SystemUsingMatrix = {
  type: VotingSystem
  computeScoresFromMatrix(matrix: Matrix): ScoreObject
}

export type System = SystemUsingRankings | SystemUsingMatrix
