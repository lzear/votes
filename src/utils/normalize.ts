import difference from 'lodash/difference'
import every from 'lodash/every'
import flatten from 'lodash/flatten'
import intersection from 'lodash/intersection'
import isEqual from 'lodash/isEqual'
import uniq from 'lodash/uniq'

import { Ballot } from '../types'

export const isBallotEqual = (a: string[][], b: string[][]): boolean =>
  every(a, (rank, k) => isEqual([...rank].sort(), [...b[k]].sort()))

export const normalizeRankinput = (
  rankinput: (string | string[])[],
): string[][] =>
  rankinput.map((rank) => (typeof rank === 'string' ? [rank] : rank))

export const groupBallots = <B extends Ballot>(ballots: B[]): B[] =>
  ballots
    .reduce((acc, ballot) => {
      const match = acc.findIndex((b) =>
        isBallotEqual(b.ranking, ballot.ranking),
      )
      if (match === -1) return [...acc, ballot]
      return acc.map((b, k) =>
        k === match
          ? {
              ...b,
              weight: b.weight + ballot.weight,
            }
          : b,
      )
    }, [] as B[])
    .filter((b) => b.weight !== 0)

export const toWeightedBallots = (ballots: string[][][]): Ballot[] =>
  ballots.reduce((w, ballot) => {
    const match = w.findIndex((ww) => isBallotEqual(ww.ranking, ballot))
    if (match === -1) {
      return [...w, { ranking: ballot, weight: 1 }]
    }
    return w.map((ww, k) =>
      k === match
        ? {
            ranking: w[match].ranking,
            weight: w[match].weight + 1,
          }
        : ww,
    )
  }, [] as Ballot[])

export const checkDuplicatedCandidate = (ranking: string[][]): void => {
  ranking.reduce((acc, rank) => {
    const inter = intersection(acc, rank)
    if (inter.length) {
      throw Error(`Some candidates are present multiple times: ${inter}`)
    }
    return [...acc, ...rank]
  }, [])
}

export const removeDuplicatedCandidates = (ranking: string[][]): string[][] =>
  ranking.reduce(
    (acc, cur) => {
      const unique = difference(uniq(cur), acc.usedCandidates)
      return {
        ranking: unique.length ? [...acc.ranking, unique] : acc.ranking,
        usedCandidates: [...acc.usedCandidates, ...unique],
      }
    },
    { ranking: [] as string[][], usedCandidates: [] as string[] },
  ).ranking

export const removeInvalidCandidates = (
  ranking: string[][],
  candidates: string[],
): string[][] =>
  ranking
    .map((names) => names.filter((name) => candidates.includes(name)))
    .filter((rank) => rank.length)

export const normalizeRanking = (
  ranking: string[][],
  candidates: string[],
): string[][] =>
  removeDuplicatedCandidates(removeInvalidCandidates(ranking, candidates))

export const normalizeBallot = <B extends Ballot>(
  ballot: B,
  candidates: string[],
): B => ({
  ...ballot,
  ranking: normalizeRanking(ballot.ranking, candidates),
})

export const candidatesFromBallots = (ballots: Ballot[]): string[] =>
  ballots.reduce(
    (acc, curr) => uniq([...acc, ...flatten(curr.ranking)]),
    [] as string[],
  )

export const normalizeBallots = <B extends Ballot>(
  ballots: B[],
  candidates?: string[],
): B[] => {
  const c = candidates || candidatesFromBallots(ballots)
  return ballots.map((ballot) => normalizeBallot(ballot, c))
}
