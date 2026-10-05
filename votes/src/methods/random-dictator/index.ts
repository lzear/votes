import { RandomBallotMethod } from '../../classes/random-ballot-method'
import type { Ballot, ScoreObject } from '../../types'
import { nonBlank, scoresZero, totalBallotsWeight, weightOf } from '../../utils'
import { sum } from '../../utils/sum'
import { refine, serialRanking } from '../dictator'

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
  // `ratio` was 1: the last ballot.
  return ballots.length - 1
}

// The ballots in random order, each drawn by weight among those left.
function* drawOrder<C extends string>(
  ballots: Ballot<C>[],
  rng: () => number,
): Generator<Ballot<C>> {
  const left = ballots.filter((b) => weightOf(b) > 0)
  while (left.length > 0) yield* left.splice(pickBallotIdx(left, rng()), 1)
}

// Each candidate's chance to win from the tie `tier`: the first drawn ballot
// that splits it hands it to its top part, so each part gets the weight of the
// ballots that make it. Shared evenly when no ballot splits it.
const winChances = <C extends string>(
  tier: C[],
  ballots: Ballot<C>[],
  memo: Map<string, Map<C, number>>,
): Map<C, number> => {
  const key = JSON.stringify(tier)
  const known = memo.get(key)
  if (known) return known
  const parts = new Map<string, { top: C[]; weight: number }>()
  for (const ballot of ballots) {
    const [top = []] = refine([tier], ballot)
    if (top.length === tier.length) continue
    const k = JSON.stringify(top)
    const weight = (parts.get(k)?.weight ?? 0) + weightOf(ballot)
    parts.set(k, { top, weight })
  }
  const parted = parts.values().toArray()
  const total = sum(parted.map((p) => p.weight))
  const chances = new Map<C, number>()
  if (total <= 0) for (const c of tier) chances.set(c, 1 / tier.length)
  else
    for (const { top, weight } of parted)
      for (const [c, p] of winChances(top, ballots, memo))
        chances.set(c, (chances.get(c) ?? 0) + (p * weight) / total)
  memo.set(key, chances)
  return chances
}

/**
 * Ranks as a ballot drawn at random by weight, breaking its ties with the next
 * drawn and so on: `Dictator` on ballots in random order.
 *
 * #### Wikipedia: [Random ballot](https://en.wikipedia.org/wiki/Random_ballot)
 */
export class RandomDictator<C extends string> extends RandomBallotMethod<C> {
  public static readonly label = 'RandomDictator'

  public probabilities(): ScoreObject<C> {
    const ballots = this.ballots.filter((b) => weightOf(b) > 0)
    return {
      ...scoresZero(this.candidates),
      ...Object.fromEntries(winChances(this.candidates, ballots, new Map())),
    }
  }

  protected draw(): C[][] {
    const ballots = nonBlank(this.ballots, this.candidates)
    return serialRanking(this.candidates, drawOrder(ballots, this.rng))
  }
}
