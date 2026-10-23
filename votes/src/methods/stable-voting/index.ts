/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, Profile, ScoreObject } from '../../types'
import { roundToGrid } from '../../utils/make-matrix'
import { splitCycleDefeats } from '../split-cycle'

// Stable Voting's winners among each set of candidates, a bitmask of their
// indexes: an undefeated `a` who wins without some `b`, by the largest
// margin of `a` over `b`; every one of them on a tie of margins.
const stableVoting = (
  array: readonly (readonly number[])[],
): ((set: number) => number[]) => {
  const memo = new Map<number, number[]>()
  const winners = (set: number): number[] => {
    const known = memo.get(set)
    if (known) return known
    const members = array
      .keys()
      .filter((i) => set & (1 << i))
      .toArray()
    const sub = members.map((i) => members.map((j) => array[i]![j]!))
    const defeats = splitCycleDefeats({
      candidates: members.map(String),
      array: sub,
    })
    const undefeated = members.filter((_, a) =>
      defeats.every((row) => row[a] === 0),
    )
    let found = undefeated
    if (undefeated.length > 1) {
      const pairs = undefeated.flatMap((a) =>
        members
          .filter((b) => b !== a)
          .map((b) => ({
            a,
            b,
            margin: roundToGrid(array[a]![b]! - array[b]![a]!),
          })),
      )
      // Margins are on the tie tolerance's grid: equal ones are equal.
      const margins = [...new Set(pairs.map((p) => p.margin))].toSorted(
        (x, y) => y - x,
      )
      for (const margin of margins) {
        const stable = new Set(
          pairs
            .filter((p) => p.margin === margin)
            .filter(({ a, b }) => winners(set & ~(1 << b)).includes(a))
            .map(({ a }) => a),
        )
        if (stable.size > 0) {
          found = undefeated.filter((a) => stable.has(a))
          break
        }
      }
    }
    memo.set(set, found)
    return found
  }
  return winners
}

/**
Among the candidates Split Cycle leaves undefeated, takes each `a` against
`b` from the largest margin of `a` over `b` down, and elects the first `a`
who wins without `b`. Below the winners, it ranks by running again without
them.

⚠️ Exponential in the number of candidates at worst: majority cycles through
16 candidates take about a tenth of a second, through 20 a few seconds. `scores()`
throws beyond `maxCandidates` (default 20, at most 30).

#### Holliday & Pacuit: [Stable Voting](https://arxiv.org/abs/2108.00542)
*/
export class StableVoting<C extends string> extends MatrixScoreMethod<C> {
  public static readonly label = 'StableVoting'

  /**
  The most candidates `scores()` takes: the `maxCandidates` option.
  */
  public readonly maxCandidates: number

  constructor(
    i: (Matrix<C> | Profile<C>) & {
      /**
      The most candidates `scores()` takes before it throws (default 20,
      at most 30).
      */
      maxCandidates?: number | undefined
    },
  ) {
    super(i)
    // Sets of candidates are 32-bit masks.
    this.maxCandidates = Math.min(i.maxCandidates ?? 20, 30)
  }

  public scores(): ScoreObject<C> {
    const { candidates, array } = this.matrix
    if (candidates.length > this.maxCandidates)
      throw new RangeError(
        `StableVoting takes at most ${this.maxCandidates} candidates, not ${candidates.length}`,
      )
    const winners = stableVoting(array)
    // Each candidate scores how many rank below it.
    const scores = new Map<C, number>()
    let left = 2 ** candidates.length - 1
    let below = candidates.length
    while (left > 0) {
      const tier = winners(left)
      below -= tier.length
      for (const i of tier) {
        left &= ~(1 << i)
        scores.set(candidates[i]!, below)
      }
    }
    return Object.fromEntries(scores) as ScoreObject<C>
  }
}
