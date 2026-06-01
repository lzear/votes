/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RandomBallotMethod } from '../../classes/random-ballot-method'
import type { Ballot } from '../../types'
import { normalizeRanking, totalBallotsWeight } from '../../utils'

const pickBallotIdx = <C extends string>(
  ballots: Ballot<C>[],
  ratio: number,
) => {
  const pickAt = ratio * totalBallotsWeight(ballots)
  let w = 0
  for (const [i, ballot] of ballots.entries()) {
    w += ballot.weight
    if (w > pickAt) return i
  }
  return ballots.length - 1
}

const rank = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
  rng: () => number,
): C[][] => {
  if (candidates.length === 0) return []
  if (ballots.length === 0) return [candidates]

  const ratio = rng()
  const idx = pickBallotIdx(ballots, ratio)
  return normalizeRanking(ballots[idx]!.ranking, candidates)
}

export class RandomDictator<C extends string> extends RandomBallotMethod<C> {
  public constructor(i: {
    candidates: C[]
    ballots: Ballot<C>[]
    rng?: (() => number) | undefined
  }) {
    super(i)
  }

  public ranking(): C[][] {
    return rank(this.candidates, this.ballots, this.rng)
  }
}
