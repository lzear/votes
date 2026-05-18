/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RandomBallotMethod } from '../../classes/random-ballot-method'
import type { Ballot } from '../../types'
import { totalBallotsWeight } from '../../utils/normalize'

const pickBallotIdx = <C extends string>(
  ballots: Ballot<C>[],
  ratio: number,
) => {
  const W = totalBallotsWeight(ballots)
  const pickAt = ratio * W
  let w = 0
  let i = 0

  while (w < pickAt) {
    const b = ballots[i]
    if (!b) throw new Error('Could not pick a ballot?!')
    w += b.weight
    if (w >= pickAt) return i
    i++
  }
  throw new Error('Could not pick a ballot?!')
}

const rank = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
  rng: () => number,
) => {
  if (candidates.length === 0) return []
  if (ballots.length === 0) return [candidates]

  const ratio = rng()
  const idx = pickBallotIdx(ballots, ratio)
  return ballots[idx]!.ranking
}

export class RandomDictator<C extends string> extends RandomBallotMethod<C> {
  constructor(i: {
    ballots: Ballot<C>[]
    candidates: C[]
    rng?: () => number
  }) {
    super(i)
  }

  public ranking(): C[][] {
    return rank(this.candidates, this.ballots, this.rng)
  }
}
