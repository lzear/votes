import _ from 'lodash'
import { emojis } from './emojis'
import { utils } from 'votes'
import { randomString } from './random-string'
import { BallotWithId, StoreBallots } from './ballot-with-id'

const { groupBallots } = utils

const mergeDraw = <T>(initial: T[][], toAdd: T) => {
  const idx = Math.floor(Math.random() * initial.length)

  if (initial[idx]?.length) initial[idx] = [...initial[idx], toAdd]
  else initial[idx] = [toAdd]

  return initial
}

const mergeNotDraw = <T>(initial: T[][], toAdd: T) => {
  const idx = Math.floor(Math.random() * (initial.length + 1))
  initial.splice(idx, 0, [toAdd])
  return initial
}

const mergeIn = <T>(a: T[][], b: T[], drawRate: number) => {
  let initial = [...a]
  const toAdd = [...b]
  while (toAdd.length > 0) {
    const element = toAdd.pop()
    if (element === undefined) throw new Error('wtf')
    initial =
      Math.random() <= drawRate
        ? mergeDraw(initial, element)
        : mergeNotDraw(initial, element)
  }
  return initial
}

const randomRanking = <T>(candidates: T[], drawRate: number): T[][] =>
  mergeIn([], candidates, drawRate)

export const randomBallot = (
  candidates: string[],
  drawRate: number,
): BallotWithId => ({
  id: randomString(),
  weight: 1,
  ranking: randomRanking(candidates, drawRate),
})

export const updateCandidateList = (
  desiredLength: number,
  currentList?: string[],
): string[] => {
  const list = currentList || []
  if (list.length > desiredLength) return _.take(currentList, desiredLength)
  if (list.length < desiredLength)
    return [
      ...list,
      ..._.sampleSize(_.difference(emojis, list), desiredLength - list.length),
    ]
  return list
}

type WithWeights = { weight: number }
export const totalWeight = (ballots: WithWeights[]): number =>
  ballots.reduce((acc, ballot) => acc + ballot.weight, 0)

export const syncBallotCandidates = (
  oldBallots: BallotWithId[],
  candidates: string[],
  drawRate: number,
): StoreBallots[] => {
  const bbb = oldBallots.flatMap((b: BallotWithId) => {
    const newRanking = b.ranking
      .map((r) => r.filter((v) => candidates.includes(v)))
      .filter((r) => r.length)
    const toAdd = _.difference(candidates, newRanking.flat())

    return toAdd.length === 0
      ? {
          ...b,
          ranking: newRanking,
        }
      : new Array(b.weight).fill(null).map((_b, idx) => ({
          id: idx === 0 ? b.id : randomString(),
          ranking: mergeIn(newRanking, toAdd, drawRate),
          weight: 1,
        }))
  })
  return groupBallots(bbb).map((b, idx) => ({ ...b, idx }))
}

const emptyBallot = (): BallotWithId => ({
  weight: 1,
  ranking: [],
  id: randomString(),
})

export const initBallots = (
  count: number,
  candidates: string[],
  drawRate: number,
): StoreBallots[] => {
  const ballot = new Array(3).fill(null).map(() => emptyBallot())
  return syncBallotCandidates(ballot, candidates, drawRate)
}
export const initCandidates = (count: number): string[] =>
  _.sampleSize(emojis, count)

export type Candidate = {
  id: string
  color: string
}
