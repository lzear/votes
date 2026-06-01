import type { ScoreObject } from '../types'
import { scoresToRanking } from '../utils'
import { BallotMethod } from './ballot-method'
import { type Scorer } from './score-method'
export abstract class BallotScoreMethod<C extends string>
  extends BallotMethod<C>
  implements Scorer<C>
{
  public abstract scores(): ScoreObject<C>

  public ranking(): C[][] {
    return scoresToRanking(this.scores())
  }
}
