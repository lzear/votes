import type { Ranking, ScoreObject } from '../types'
import { scoresToRanking } from '../utils'
import { Method, type Ranker } from './method'

export type Scorer<C extends string> = {
  scores(): ScoreObject<C>
} & Ranker<C>

/**
Voting method that ranks candidates by score, highest first.
*/
export abstract class ScoreMethod<C extends string>
  extends Method<C>
  implements Scorer<C>
{
  private _scores?: ScoreObject<C>

  public abstract scores(): ScoreObject<C>

  public ranking(): Ranking<C> {
    this._scores ??= this.scores()
    return scoresToRanking(this._scores)
  }
}
