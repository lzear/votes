import _ from 'lodash'

import type { Ballot } from '../types'

/**
 * Returns true if the 2 ballots are equivalent. The order of the candidates inside a rank is irrelevant. Reflexive check.
 *
 * @param a - first ballot
 * @param b - second ballot
 */
export const isBallotEqual = (a: string[][], b: string[][]): boolean => {
  if (a.length !== b.length) return false
  if (a.length === 0) return true
  return _.every(a, (rank, k) => _.isEqual([...rank].sort(), [...b[k]].sort()))
}

/**
 * Convert `(string | string[])[]` to `string[][]`.
 * Elements of the input that are strings are converted to singletons.
 *
 * @param rankInput - Input rank
 */
export const normalizeRankInput = (
  rankInput: (string | string[])[],
): string[][] =>
  rankInput.map((rank) => (typeof rank === 'string' ? [rank] : rank))

/**
 * Group ballots by merging equivalent ballots (see {@link isBallotEqual}).
 *
 * @param ballots - ballots to group
 */
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
    .sort((a, b) => b.weight - a.weight)

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
    const inter = _.intersection(acc, rank)
    if (inter.length > 0) {
      throw new Error(`Some candidates are present multiple times: ${inter}`)
    }
    return [...acc, ...rank]
  }, [])
}

/**
 * Remove candidates that are duplicated inside a ranking. Prevents cheating!
 *
 * @param ranking - input ranking
 */
export const removeDuplicatedCandidates = (ranking: string[][]): string[][] =>
  ranking.reduce(
    (acc, cur) => {
      const unique = _.difference(_.uniq(cur), acc.usedCandidates)
      return {
        ranking: unique.length > 0 ? [...acc.ranking, unique] : acc.ranking,
        usedCandidates: [...acc.usedCandidates, ...unique],
      }
    },
    {
      ranking: [] as string[][],
      usedCandidates: [] as string[],
    },
  ).ranking

/**
 * Remove candidates in `ranking` that don't exist in `candidates`. Prevents cheating!
 *
 * @param ranking - ranking to check
 * @param candidates - official candidates
 */
export const removeInvalidCandidates = (
  ranking: string[][],
  candidates: string[],
): string[][] =>
  ranking
    .map((names) => names.filter((name) => candidates.includes(name)))
    .filter((rank) => rank.length)

/**
 * Prevents cheating!
 *
 * @param ranking - ranking to normalize
 * @param candidates - official candidates
 */
export const normalizeRanking = (
  ranking: string[][],
  candidates: string[],
): string[][] =>
  removeDuplicatedCandidates(removeInvalidCandidates(ranking, candidates))

/**
 * Prevents cheating!
 *
 * @param ballot - ballot to normalize
 * @param candidates - official candidates
 */
export const normalizeBallot = <B extends Ballot>(
  ballot: B,
  candidates: string[],
): B => ({
  ...ballot,
  ranking: normalizeRanking(ballot.ranking, candidates),
})

/**
 * Gather all the candidates present in `ballots`
 *
 * @param ballots - ranking to normalize
 */
export const candidatesFromBallots = (ballots: Ballot[]): string[] =>
  ballots.reduce(
    (acc, curr) => _.uniq([...acc, ...curr.ranking.flat()]),
    [] as string[],
  )

export const normalizeBallots = <B extends Ballot>(
  ballots: B[],
  candidates?: string[],
): B[] => {
  const c = candidates || candidatesFromBallots(ballots)
  return ballots.map((ballot) => normalizeBallot(ballot, c))
}

export const totalBallotsWeight = (ballots: Ballot[]): number =>
  ballots.reduce((acc, ballot) => acc + ballot.weight, 0)
