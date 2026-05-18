import type { ScoreObject } from '../types'
import { scoresToRanking } from '../utils/scores'
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
  public abstract scores(): ScoreObject<C>

  public ranking(): C[][] {
    return scoresToRanking(this.scores())
  }
}
