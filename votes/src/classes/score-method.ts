import type { ScoreObject } from '../types'
import { scoresToRanking } from '../utils/scores'

import type { Ranker } from './method'
import { Method } from './method'

export interface Scorer extends Ranker {
  scores(): ScoreObject
}

/**
 * Voting method for which the ballots are not necessary: the matrix of duels in enough.
 */
export abstract class ScoreMethod extends Method implements Scorer {
  public abstract scores(): ScoreObject

  public ranking(): string[][] {
    return scoresToRanking(this.scores())
  }
}
