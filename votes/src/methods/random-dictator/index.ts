import { RandomBallotMethod } from '../../classes/random-ballot-method'
import type { Ballot, Ranking, ScoreObject } from '../../types'
import { nonBlank, scoresZero, totalBallotsWeight, weightOf } from '../../utils'
import { sum } from '../../utils/sum'
import { serialRanking } from '../dictator'

// Ballots probabilities() reads at most by default: about a second.
const MAX_READS = 2_000_000

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

// A ballot as the place it gives each candidate, by index.
type Places = { place: number[]; weight: number }

// The candidates of `tier` that `place` ranks highest.
const topOf = (tier: readonly number[], place: number[]): number[] => {
  let top: number[] = []
  let best = Infinity
  for (const c of tier) {
    const p = place[c] ?? Infinity
    if (p < best) [top, best] = [[c], p]
    else if (p === best) top.push(c)
  }
  return top
}

// Each candidate's chance to win, by index. From a tie, the first drawn ballot
// that splits it hands it to its top part, so each part gets the weight of the
// ballots that make it; shared evenly when none splits it. Each tie reads
// every ballot, and tied ballots can make exponentially many ties: past
// `maxReads` ballots read after the first tie, it throws.
const winChances = (
  ballots: Places[],
  candidates: readonly number[],
  maxReads: number,
): Map<number, number> => {
  const memo = new Map<string, Map<number, number>>()
  let reads = -ballots.length
  const chancesFrom = (tier: readonly number[]): Map<number, number> => {
    if (tier.length === 1) return new Map(tier.map((c) => [c, 1]))
    const key = tier.join(',')
    const known = memo.get(key)
    if (known) return known
    reads += ballots.length
    if (reads > maxReads)
      throw new RangeError(
        `RandomDictator reads at most maxReads (${maxReads}) ballots`,
      )
    const parts = new Map<string, { top: number[]; weight: number }>()
    for (const { place, weight } of ballots) {
      const top = topOf(tier, place)
      if (top.length === tier.length) continue
      const k = top.join(',')
      parts.set(k, { top, weight: (parts.get(k)?.weight ?? 0) + weight })
    }
    const parted = parts.values().toArray()
    const total = sum(parted.map((p) => p.weight))
    const chances = new Map<number, number>()
    if (total <= 0) for (const c of tier) chances.set(c, 1 / tier.length)
    else
      for (const { top, weight } of parted)
        for (const [c, p] of chancesFrom(top))
          chances.set(c, (chances.get(c) ?? 0) + (p * weight) / total)
    memo.set(key, chances)
    return chances
  }
  return chancesFrom(candidates)
}

/**
Ranks as a ballot drawn at random by weight, breaking its ties with the next
drawn and so on: `Dictator` on ballots in random order.

`probabilities()` is exact, and exponential in the ties ballots leave. It reads
identical ballots as one, and each tie it explores reads every ballot: past
`maxReads` ballots read after the first tie (default 2,000,000, about a
second), it throws. Strict ballots explore the first tie alone, whatever their
size; `ranking()` has no cap.

#### Wikipedia: [Random ballot](https://en.wikipedia.org/wiki/Random_ballot)
*/
export class RandomDictator<C extends string> extends RandomBallotMethod<C> {
  public static readonly label = 'RandomDictator'

  public readonly maxReads: number

  constructor(
    i: ConstructorParameters<typeof RandomBallotMethod<C>>[0] & {
      maxReads?: number
    },
  ) {
    super(i)
    this.maxReads = i.maxReads ?? MAX_READS
  }

  public probabilities(): ScoreObject<C> {
    const index = new Map(this.candidates.map((c, i) => [c, i]))
    // Identical ballots read as one, their weights summed.
    const ballots = new Map<string, Places>()
    for (const ballot of this.ballots) {
      const weight = weightOf(ballot)
      if (weight <= 0) continue
      const place = this.candidates.map(() => Infinity)
      for (const [p, tier] of ballot.ranking.entries())
        for (const c of tier) {
          const i = index.get(c)
          if (i !== undefined) place[i] = p
        }
      const key = place.join(',')
      const merged = (ballots.get(key)?.weight ?? 0) + weight
      ballots.set(key, { place, weight: merged })
    }
    const chances = winChances(
      ballots.values().toArray(),
      this.candidates.keys().toArray(),
      this.maxReads,
    )
    const scores = scoresZero(this.candidates)
    for (const [i, c] of this.candidates.entries())
      scores[c] = chances.get(i) ?? 0
    return scores
  }

  /**
  @internal
  */
  protected draw(): Ranking<C> {
    const ballots = nonBlank(this.ballots, this.candidates)
    return serialRanking(this.candidates, drawOrder(ballots, this.rng))
  }
}
