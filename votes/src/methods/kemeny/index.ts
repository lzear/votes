/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import { type Matrix, type ScoreObject } from '../../types'
import { config } from '../../utils/config'
import { sum } from '../../utils/sum'

// Visits every non-empty subset of candidates, as a bitmask, in increasing
// order, with `col[c]`: the voters preferring a member of it over `c`.
const forEachSubset = (
  array: number[][],
  visit: (set: number, col: Float64Array) => void,
): void => {
  const n = array.length
  const col = new Float64Array(n)
  for (let set = 1; set < 1 << n; set++) {
    // From set - 1 to set, bits below the lowest one turn off, and it on.
    const low = 31 - Math.clz32(set & -set)
    for (let b = 0; b <= low; b++)
      for (let c = 0; c < n; c++)
        col[c]! += (b === low ? 1 : -1) * array[b]![c]!
    visit(set, col)
  }
}

// Dynamic programming over subsets, O(n·2ⁿ): the least disagreement of an
// order of each subset, how many orders reach it, then how often each
// candidate sits above how many others across the best orders of everyone.
const computeScores = <C extends string>({
  candidates,
  array,
}: Matrix<C>): ScoreObject<C> => {
  const n = candidates.length
  // Subsets are 32-bit masks.
  if (n > 30)
    throw new RangeError(`Kemeny takes at most 30 candidates, not ${n}`)
  const all = (1 << n) - 1
  const internal = new Float64Array(all + 1)
  const count = new Float64Array(all + 1)
  // `internal`, plus disagreements with ranking the subset above the rest.
  const top = new Float64Array(all + 1)
  count[0] = 1
  const total = candidates.map((_, c) => sum(array.map((row) => row[c]!)))

  forEachSubset(array, (set, col) => {
    let best = Infinity
    let ways = 0
    let cross = 0
    for (let c = 0; c < n; c++) {
      if ((set & (1 << c)) === 0) continue
      cross += total[c]! - col[c]!
      // `c` first in the subset.
      const rest = set ^ (1 << c)
      const cost = internal[rest]! + col[c]!
      if (cost < best - config.EPSILON) [best, ways] = [cost, count[rest]!]
      else if (cost <= best + config.EPSILON) ways += count[rest]!
    }
    internal[set] = best
    count[set] = ways
    top[set] = best + cross
  })

  const below = new Float64Array(n)
  forEachSubset(array, (set, col) => {
    const lower = all ^ set
    let size = 0
    for (let c = 0; c < n; c++) if (set & (1 << c)) size++
    for (let c = 0; c < n; c++) {
      if ((set & (1 << c)) === 0) continue
      // `c` last of the top `set`, above the rest.
      const upper = set ^ (1 << c)
      const cost = top[upper]! + total[c]! - col[c]! + internal[lower]!
      if (cost <= internal[all]! + config.EPSILON)
        below[c]! += (n - size) * count[upper]! * count[lower]!
    }
  })

  return Object.fromEntries(
    candidates.map((c, i) => [c, below[i]! / count[all]!]),
  ) as ScoreObject<C>
}

/**
 * Scores are how many candidates each one ranks above, averaged over the
 * best orders. Runs in O(n·2ⁿ) time and memory: slow beyond ~20 candidates,
 * and throws beyond 30.
 *
 * #### Wikipedia: [Kemeny–Young method](https://en.wikipedia.org/wiki/Kemeny%E2%80%93Young_method)
 */
export class Kemeny<C extends string> extends MatrixScoreMethod<C> {
  public scores(): ScoreObject<C> {
    return computeScores(this.matrix)
  }
}
