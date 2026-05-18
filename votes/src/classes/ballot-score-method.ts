import type { ScoreObject } from '../types'
import { scoresToRanking } from '../utils'
import { BallotMethod } from './ballot-method'
import type { Scorer } from './score-method'

export abstract class BallotScoreMethod<C extends string>
  extends BallotMethod<C>
  implements Scorer<C>
{
  private _scores?: ScoreObject<C>

  public abstract scores(): ScoreObject<C>

  public ranking(): C[][] {
    this._scores ??= this.scores()
    return scoresToRanking(this._scores)
  }
}
