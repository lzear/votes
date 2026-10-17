import type { Ballot } from '../../types'
import { normalizeBallots } from '../../utils'
import { TwoRoundRunoff } from '../two-round-runoff'

// The tiers holding a ballot's first `places` places.
const firstPlaces = <C extends string>(
  { ranking, ...ballot }: Ballot<C>,
  places: number,
): Ballot<C> => {
  let above = 0
  return {
    ...ballot,
    ranking: ranking.filter((tier) => {
      const kept = above < places
      above += tier.length
      return kept
    }),
  }
}

/**
`TwoRoundRunoff` on each ballot's first two places alone (`preferences`,
default 2; Sri Lanka's counts 3): a ballot that ranks neither finalist there
counts for neither in the runoff, where `TwoRoundRunoff` reads its whole
ranking. The two agree when no ballot ranks past `preferences`.

#### Wikipedia: [Contingent vote](https://en.wikipedia.org/wiki/Contingent_vote)
*/
export class SupplementaryVote<C extends string> extends TwoRoundRunoff<C> {
  public static override readonly label = 'SupplementaryVote'

  public readonly preferences: number

  constructor(
    input: ConstructorParameters<typeof TwoRoundRunoff<C>>[0] & {
      preferences?: number
    },
  ) {
    const preferences = input.preferences ?? 2
    super({
      ...input,
      ballots: normalizeBallots(input.ballots, input.candidates, false).map(
        (b) => firstPlaces(b, preferences),
      ),
      // Places past the last are not votes.
      unrankedLast: false,
    })
    this.preferences = preferences
  }
}
