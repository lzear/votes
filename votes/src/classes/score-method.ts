import type { ScoreObject } from '../types'
import { scoresToRanking } from '../utils'
import { Method, type Ranker } from './method'

export interface Scorer<C extends string> extends Ranker<C> {
  scores(): ScoreObject<C>
}

/**
 * Voting method that ranks candidates by score, highest first.
 */
export abstract class ScoreMethod<C extends string>
  extends Method<C>
  implements Scorer<C>
{
  private _scores?: ScoreObject<C>

  public abstract scores(): ScoreObject<C>

  public ranking(): C[][] {
    this._scores ??= this.scores()
    return scoresToRanking(this._scores)
  }
}
