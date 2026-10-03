import { BallotMethod } from '../../classes/ballot-method'
import type { Ballot } from '../../types'
import { weightOf } from '../../utils'

// Splits each tier by the ballot, the candidates it leaves out last.
export const refine = <C extends string>(
  tiers: C[][],
  ballot: Ballot<C>,
): C[][] => {
  const place = new Map(
    ballot.ranking.flatMap((tier, i) => tier.map((c) => [c, i] as const)),
  )
  return tiers.flatMap((tier) => {
    const byPlace = Map.groupBy(tier, (c) => place.get(c) ?? Infinity)
    return byPlace
      .entries()
      .toArray()
      .toSorted(([a], [b]) => a - b)
      .map(([, candidates]) => candidates)
  })
}

// The first ballot's ranking, its ties broken by the next, and so on. Reads
// `ballots` only until no tie is left.
export const serialRanking = <C extends string>(
  candidates: C[],
  ballots: Iterable<Ballot<C>>,
): C[][] => {
  let tiers = candidates.length > 0 ? [candidates] : []
  for (const ballot of ballots) {
    if (tiers.length === candidates.length) break
    if (weightOf(ballot) > 0) tiers = refine(tiers, ballot)
  }
  return tiers
}

/**
Ranks as the first ballot, breaking its ties with the next, and so on: a
deterministic last resort, or a serial dictatorship.
`RandomDictator` with `rng: () => 0` ranks the same.

#### Wikipedia: [Dictatorship mechanism](https://en.wikipedia.org/wiki/Dictatorship_mechanism)
*/
export class Dictator<C extends string> extends BallotMethod<C> {
  public static readonly label = 'Dictator'

  public ranking(): C[][] {
    return serialRanking(this.candidates, this.ballots)
  }
}
