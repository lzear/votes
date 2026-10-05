import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { config } from '../../utils/config'
import { sum } from '../../utils/sum'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

/**
 * #### Wikipedia: [Instant-runoff voting](https://en.wikipedia.org/wiki/Instant-runoff_voting)
 */
export class InstantRunoff<C extends string> extends TbEliminateLast<C> {
  // Bulk exclusion: what the group passes among itself leaves it below the
  // others.
  protected override canEliminateTogether(group: C[], race: C[]): boolean {
    const scores = firstChoices(this.ballots, race)
    const below = Math.min(
      ...race.filter((c) => !group.includes(c)).map((c) => scores[c]),
    )
    return (
      sum(group.map((c) => scores[c])) + config.EPSILON < below ||
      super.canEliminateTogether(group, race)
    )
  }

  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = firstChoices(this.ballots, candidates)
    return { ranking: scoresToRanking(scores), scores }
  }
}
