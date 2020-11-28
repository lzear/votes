import fill from 'lodash/fill'
import random from 'lodash/random'
import range from 'lodash/range'
import shuffle from 'lodash/shuffle'
import { Ballot } from '../types'
import { toWeightedBallots } from '../utils'

export const abcde = ['a', 'b', 'c', 'd', 'e']

export const balinski: Ballot[] = toWeightedBallots([
  ...fill(Array(33), [['a'], ['b'], ['c'], ['d'], ['e']]),
  ...fill(Array(16), [['b'], ['d'], ['c'], ['e'], ['a']]),
  ...fill(Array(3), [['c'], ['d'], ['b'], ['a'], ['e']]),
  ...fill(Array(8), [['c'], ['e'], ['b'], ['d'], ['a']]),
  ...fill(Array(18), [['d'], ['e'], ['c'], ['b'], ['a']]),
  ...fill(Array(22), [['e'], ['c'], ['b'], ['d'], ['a']]),
])

export const sW: Ballot[] = toWeightedBallots([
  ...fill(Array(5), [['a'], ['c'], ['b'], ['e'], ['d']]),
  ...fill(Array(5), [['a'], ['d'], ['e'], ['c'], ['b']]),
  ...fill(Array(8), [['b'], ['e'], ['d'], ['a'], ['c']]),
  ...fill(Array(3), [['c'], ['a'], ['b'], ['e'], ['d']]),
  ...fill(Array(7), [['c'], ['a'], ['e'], ['b'], ['d']]),
  ...fill(Array(2), [['c'], ['b'], ['a'], ['d'], ['e']]),
  ...fill(Array(7), [['d'], ['c'], ['e'], ['b'], ['a']]),
  ...fill(Array(8), [['e'], ['b'], ['a'], ['d'], ['c']]),
])

export const dummyProfile: Ballot[] = toWeightedBallots([
  [['a'], ['b'], ['c'], ['d'], ['e']],
])

export const dummyProfile10: Ballot[] = toWeightedBallots(
  fill(Array(10), [['a'], ['b'], ['c'], ['d'], ['e']]),
)

const randomBallot = (candidates: string[], minWeight = 1, maxWeight = 10) => ({
  ranking: shuffle(candidates).map((c) => [c]),
  weight: random(minWeight, maxWeight),
})

export const nCandidates = (n: number): string[] =>
  range(n).map((idx) => String.fromCharCode(65 + idx))

export const randomBallots = (
  minCandidates = 4,
  maxCandidates = 6,
  minBallots = 4,
  maxBallots = 6,
): { ballots: Ballot[]; candidates: string[] } => {
  const nCandidates = random(minCandidates, maxCandidates)
  const nBallots = random(minBallots, maxBallots)
  const candidates = range(nCandidates).map((idx) =>
    String.fromCharCode(65 + idx),
  )
  return {
    ballots: range(nBallots).map(() => randomBallot(candidates)),
    candidates,
  }
}
