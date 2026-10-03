/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RandomBallotMethod } from '../../classes/random-ballot-method'
import { type Ballot } from '../../types'
import { totalBallotsWeight, weightOf } from '../../utils'
import { completeRanking } from '../../utils/normalize'

const pickBallotIdx = <C extends string>(
  ballots: Ballot<C>[],
  ratio: number,
) => {
  const pickAt = ratio * totalBallotsWeight(ballots)
  let w = 0
  for (const [i, ballot] of ballots.entries()) {
    w += weightOf(ballot)
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
  return completeRanking(ballots[idx]!.ranking, candidates)
}

export class RandomDictator<C extends string> extends RandomBallotMethod<C> {
  protected draw(): C[][] {
    return rank(this.candidates, this.ballots, this.rng)
  }
}
