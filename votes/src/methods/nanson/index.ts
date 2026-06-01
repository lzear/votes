import { sum } from 'lodash-es'
import type { QE } from '../../classes/round-ballot-method'
import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { config } from '../../utils/config'
import { Borda } from '../borda'

/**
 * #### Wikipedia: [Nanson's method](https://en.wikipedia.org/wiki/Nanson%27s_method)
 */
export class Nanson<C extends string> extends TbEliminateLast<C> {
  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = new Borda({ candidates, ballots: this.ballots }).scores()
    return { ranking: scoresToRanking(scores), scores }
  }

  protected round(candidates: C[]): QE<C> {
    const scores = new Borda({ candidates, ballots: this.ballots }).scores()
    const values = Object.values(scores)
    const avg = sum(values) / values.length

    const qualified = candidates.filter((c) => scores[c] > avg + config.EPSILON)
    const eliminated = candidates.filter(
      (c) => scores[c] <= avg + config.EPSILON,
    )

    // All equal scores → eliminate everyone as one group (complete tie)
    if (qualified.length === 0)
      return { eliminated: candidates, qualified: [], scores }

    return { eliminated, qualified, scores }
  }
}
