import { BallotMethod } from '../../classes/ballot-method'
import { type Ballot } from '../../types'
import { weightOf } from '../../utils'

// Splits each tier by the ballot, the candidates it leaves out last.
const refine = <C extends string>(tiers: C[][], ballot: Ballot<C>): C[][] => {
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

/**
 * Ranks as the first ballot, breaking its ties with the next, and so on: a
 * deterministic last resort, or a serial dictatorship.
 *
 * #### Wikipedia: [Dictatorship mechanism](https://en.wikipedia.org/wiki/Dictatorship_mechanism)
 */
export class Dictator<C extends string> extends BallotMethod<C> {
  public ranking(): C[][] {
    let tiers = this.candidates.length > 0 ? [this.candidates] : []
    for (const ballot of this.ballots) {
      if (tiers.length === this.candidates.length) break
      if (weightOf(ballot) > 0) tiers = refine(tiers, ballot)
    }
    return tiers
  }
}
