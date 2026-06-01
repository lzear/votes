import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { ScoreObject } from '../../types'
import { FirstPastThePost } from '../first-past-the-post'

/**
 * #### Wikipedia: [Instant-runoff voting](https://en.wikipedia.org/wiki/Instant-runoff_voting)
 */
export class InstantRunoff<C extends string> extends TbEliminateLast<C> {
  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const fptp = new FirstPastThePost({ ballots: this.ballots, candidates })
    return { ranking: fptp.ranking(), scores: fptp.scores() }
  }
}
