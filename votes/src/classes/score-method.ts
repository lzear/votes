import type { ScoreObject } from '../types'
import { scoresToRanking } from '../utils'
import { Method, type Ranker } from './method'

export interface Scorer<C extends string> extends Ranker<C> {
  scores(): ScoreObject<C>
}

/**
 * Voting method for which the ballots are not necessary: the matrix of duels in enough.
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
