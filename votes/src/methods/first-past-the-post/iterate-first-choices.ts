import type { Ballot, ScoreObject } from '../../types'
import { scoresZero, weightOf } from '../../utils'

// The first tier with a candidate in `running`, found without allocating.
const firstTier = <C extends string>(
  ranking: readonly (readonly C[])[],
  running: ReadonlySet<C>,
) => ranking.find((rank) => rank.some((c) => running.has(c)))

// A ballot votes for its first tier with any of `candidates`, so ballots
// normalized against a superset of them work as they are.
export const iterateFirstChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: readonly C[],
  computeBallotScore: (tied: number) => number,
): ScoreObject<C> => {
  const result = scoresZero(candidates)
  const running = new Set(candidates)
  for (const ballot of ballots) {
    const rank = firstTier(ballot.ranking, running)
    if (!rank) continue
    let count = 0
    for (const c of rank) if (running.has(c)) count++
    const score = computeBallotScore(count) * weightOf(ballot)
    for (const c of rank) if (running.has(c)) result[c] += score
  }
  return result
}

export const firstChoices = <C extends string>(
  ballots: Ballot<C>[],
  candidates: readonly C[],
): ScoreObject<C> =>
  iterateFirstChoices(ballots, candidates, (tied) => 1 / tied)
