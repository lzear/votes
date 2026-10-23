import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { config } from '../../utils/config'
import { sum } from '../../utils/sum'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

/**
Each round, the candidate with the fewest first choices among those left
goes out, until one is left.

#### Wikipedia: [Instant-runoff voting](https://en.wikipedia.org/wiki/Instant-runoff_voting)
*/
export class InstantRunoff<C extends string> extends TbEliminateLast<C> {
  public static readonly label = 'InstantRunoff'

  // Bulk exclusion: what the group passes among itself leaves it below the
  // others.
  /**
  @internal
  */
  protected override canEliminateTogether(
    group: readonly C[],
    race: readonly C[],
  ): boolean {
    const scores = firstChoices(this.ballots, race)
    const below = Math.min(
      ...race.filter((c) => !group.includes(c)).map((c) => scores[c]),
    )
    return (
      sum(group.map((c) => scores[c])) + config.EPSILON < below ||
      super.canEliminateTogether(group, race)
    )
  }

  /**
  @internal
  */
  protected oneRound(candidates: readonly C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = firstChoices(this.ballots, candidates)
    return { ranking: scoresToRanking(scores), scores }
  }
}
