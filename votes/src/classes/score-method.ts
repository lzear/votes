import type { ScoreObject } from '../types'
import { scoresToRanking } from '../utils/scores'
import { Method, Ranker } from './method'

export interface Scorer extends Ranker {
  scores(): ScoreObject
}

export abstract class ScoreMethod extends Method implements Scorer {
  public abstract scores(): ScoreObject

  public ranking(): string[][] {
    return scoresToRanking(this.scores())
  }
}
