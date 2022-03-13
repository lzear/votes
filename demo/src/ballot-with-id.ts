import type { Ballot } from 'votes'

export type BallotWithId = Ballot & { id: string }
export type WithIdx = { idx: number }

export type StoreBallots = BallotWithId & WithIdx
