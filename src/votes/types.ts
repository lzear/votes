export interface WeightedRanking {
  ranking: Bulletin
  weight: number
}

export type Bulletin = string[][]

export type Rule = (rankings: WeightedRanking[]) => string[][]

export type ScoreObject = { [candidateId: string]: number }

export enum PollType {
  Majority = 'MAJORITY',
  Borda = 'BORDA',
  Runoff = 'RUNOFF',
  Kemeny = 'KEMENY',
  Approbation = 'APPROBATION'
}

export type matrix = {
  candidateIds: string[]
  array: number[][]
}

export type MethodFromRankings = {
  type: PollType
  computeScoresFromRankings(candidateIds: string[], rankings: Bulletin[]): ScoreObject
}

export type MethodFromMatrix = {
  type: PollType
  computeScoresFromMatrix(matrix: matrix): ScoreObject
}

export type Method = MethodFromRankings | MethodFromMatrix
