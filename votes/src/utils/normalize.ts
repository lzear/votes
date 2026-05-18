/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { difference, intersection, isEqual, uniq } from 'lodash-es'
import type { Ballot } from '../types'

/**
 * Returns true if the 2 ballots are equivalent. The order of the candidates inside a rank is irrelevant. Reflexive check.
 *
 * @param a - first ballot
 * @param b - second ballot
 */
export const isBallotEqual = (a: string[][], b: string[][]): boolean =>
  isEqual(canonizeRanking(a), canonizeRanking(b))

export const canonizeRanking = <C extends string>(ranking: C[][]): C[][] =>
  ranking
    .map((rank) => rank.toSorted((a, b) => a.localeCompare(b)))
    .filter((rank) => rank.length > 0)

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
export const groupBallots = <B extends Ballot>(ballots: B[]): B[] => {
  const acc: B[] = []
  for (const ballot of ballots) {
    const match = acc.findIndex((b) => isBallotEqual(b.ranking, ballot.ranking))
    if (match === -1) acc.push(ballot)
    else
      acc[match] = {
        ...acc[match]!,
        weight: acc[match]!.weight + ballot.weight,
      }
  }
  return acc.filter((b) => b.weight > 0).toSorted((a, b) => b.weight - a.weight)
}

export const toWeightedBallots = (ballots: string[][][]): Ballot[] => {
  const result: Ballot[] = []
  for (const ballot of ballots) {
    const match = result.findIndex((ww) => isBallotEqual(ww.ranking, ballot))
    if (match === -1) result.push({ ranking: ballot, weight: 1 })
    else
      result[match] = {
        ranking: result[match]!.ranking,
        weight: result[match]!.weight + 1,
      }
  }
  return result
}

export const checkDuplicatedCandidate = (ranking: string[][]): void => {
  const seen: string[] = []
  for (const rank of ranking) {
    const inter = intersection(seen, rank)
    if (inter.length > 0)
      throw new Error(
        `Some candidates are present multiple times: ${inter.join(', ')}`,
      )
    seen.push(...rank)
  }
}

/**
 * Remove candidates that are duplicated inside a ranking. Prevents cheating!
 *
 * @param ranking - input ranking
 */
export const removeDuplicatedCandidates = (ranking: string[][]): string[][] => {
  const result: string[][] = []
  const usedCandidates: string[] = []
  for (const cur of ranking) {
    const unique = difference(uniq(cur), usedCandidates)
    if (unique.length > 0) {
      result.push(unique)
      usedCandidates.push(...unique)
    }
  }
  return result
}

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
    .filter((rank) => rank.length > 0)

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
export const candidatesFromBallots = (ballots: Ballot[]): string[] => {
  const candidates: string[] = []
  for (const ballot of ballots) candidates.push(...ballot.ranking.flat())
  return uniq(candidates)
}

export const normalizeBallots = <B extends Ballot>(
  ballots: B[],
  candidates?: string[],
): B[] => {
  const c = candidates ?? candidatesFromBallots(ballots)
  return ballots.map((ballot) => normalizeBallot(ballot, c))
}

export const totalBallotsWeight = (ballots: Ballot[]): number =>
  ballots.reduce((acc, ballot) => acc + ballot.weight, 0)
