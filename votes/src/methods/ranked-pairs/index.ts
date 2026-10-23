/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import type { Matrix, Profile, ScoreObject } from '../../types'
import { scoresAny } from '../../utils/scores-zero'
import { type Strength, winStrength } from '../../utils/strength'
import { type Edge, lockEdges } from './lock-edges'

/**
Tiebreaker for equal-strength pairs: prefer the pair where more voters
expressed a preference (higher total participation). Meaningful only when the
matrix comes from `matrixFromBallots` (raw counts). With antisymmetric
matrices, `total = value + (-value) = 0` for every edge — all pairs compare
equal, so the group falls back to simultaneous processing and ties are
preserved.
*/
export const byTotalParticipation = (a: Edge, b: Edge): number =>
  b.total - a.total

export type EdgeSorter = (a: Edge, b: Edge) => number

/**
A pair in the lock order: `winner` beats `loser` by `strength`, and the pair
locks unless it closes a cycle.
*/
export type LockStep<C extends string> = {
  winner: C
  loser: C
  strength: number
  locked: boolean
}

// Groups of equal-strength wins, strongest first, and whether each locks.
const lock = (
  matrix: Matrix<string>,
  edgeSorter: EdgeSorter | undefined,
  strength: Strength,
): { groups: Edge[][]; locked: boolean[][] } => {
  // Pairwise wins only: a defeat would close a cycle with its own win.
  const allEdges: Edge[] = matrix.array.flatMap((row, from) =>
    row.flatMap((value, to) => {
      const against = matrix.array[to]![from]!
      return value > against
        ? {
            from,
            to,
            value: winStrength(strength, value, against),
            total: value + against,
          }
        : []
    }),
  )
  // Strongest first, then in the sorter's order. Edges neither tells apart
  // lock together, so that the result does not depend on candidate order.
  const order = (a: Edge, b: Edge) =>
    b.value - a.value || (edgeSorter?.(a, b) ?? 0)
  const groups: Edge[][] = []
  for (const edge of allEdges.toSorted(order)) {
    const group = groups.at(-1)
    if (group && order(group[0]!, edge) === 0) group.push(edge)
    else groups.push([edge])
  }
  return { groups, locked: lockEdges(matrix.candidates.length, groups) }
}

const computeFromMatrix = <C extends string>(
  matrix: Matrix<C>,
  edgeSorter: EdgeSorter | undefined,
  strength: Strength,
): ScoreObject<C> => {
  // Sources of the locked graph (no incoming locked edge) win this iteration
  const { groups, locked } = lock(matrix, edgeSorter, strength)
  const beaten = new Set(
    groups
      .flatMap((group, g) => group.filter((_, i) => locked[g]![i]!))
      .map((e) => e.to),
  )
  const winnersIdx = matrix.candidates
    .keys()
    .filter((key) => !beaten.has(key))
    .toArray()
  if (winnersIdx.length === 0 || winnersIdx.length === matrix.candidates.length)
    return scoresAny(matrix.candidates, 1)
  const nextResults = computeFromMatrix(
    {
      array: matrix.array
        .filter((_c, k) => !winnersIdx.includes(k))
        .map((row) => row.filter((_c, k) => !winnersIdx.includes(k))),
      candidates: matrix.candidates.filter((_c, k) => !winnersIdx.includes(k)),
    },
    edgeSorter,
    strength,
  )
  const maxScore2 = Math.max(
    ...Object.values(nextResults as Record<string, number>),
  )
  return {
    ...nextResults,
    ...scoresAny(
      winnersIdx.map((i) => matrix.candidates[i]!),
      maxScore2 + 1,
    ),
  }
}

/**
By default, equal-strength pairs are locked simultaneously: if they would
form a cycle among themselves, none are locked (most neutral outcome).

Pass `edgeSorter` to lock equal-strength pairs in its order instead, like
canonical Tideman; pairs it cannot tell apart still lock simultaneously.
`byTotalParticipation` (exported from this module) is a ready-made sorter
that prefers pairs where more voters expressed a preference.

The `Edge` type passed to the sorter has `{ from, to, value, total }`.

`strength` measures a pair by the winner's votes (`'winning-votes'`, the
default) or by its margin (`'margins'`): they differ when voters tie or leave
out both candidates.

#### Wikipedia: [Ranked pairs](https://en.wikipedia.org/wiki/Ranked_pairs)
*/
export class RankedPairs<C extends string> extends MatrixScoreMethod<C> {
  public static readonly label = 'RankedPairs'

  private readonly edgeSorter: EdgeSorter | undefined
  public readonly strength: Strength

  constructor(
    i: (Matrix<C> | Profile<C>) & {
      edgeSorter?: EdgeSorter | undefined
      strength?: Strength | undefined
    },
  ) {
    super(i)
    this.edgeSorter = i.edgeSorter
    this.strength = i.strength ?? 'winning-votes'
  }

  public scores(): ScoreObject<C> {
    return computeFromMatrix(this.matrix, this.edgeSorter, this.strength)
  }

  /**
  Each pairwise win, strongest first, as groups the sorter cannot tell apart:
  locked together, or skipped when it would close a cycle with the pairs
  locked before and its whole group. The winners are those no locked pair
  beats; the ranking below them runs again on the rest.
  */
  public lockSteps(): LockStep<C>[][] {
    const { candidates } = this.matrix
    const { groups, locked } = lock(this.matrix, this.edgeSorter, this.strength)
    return groups.map((group, g) =>
      group.map((e, i) => ({
        winner: candidates[e.from]!,
        loser: candidates[e.to]!,
        strength: e.value,
        locked: locked[g]![i]!,
      })),
    )
  }
}
