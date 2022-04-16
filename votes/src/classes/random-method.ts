import { Scorer } from './score-method'
import { ScoreObject } from '../types'
import { Method } from './method'

export abstract class RandomMethod extends Method implements Scorer {
  protected readonly rng: () => number

  constructor(i: { candidates: string[]; rng?: () => number }) {
    super(i.candidates)

    this.rng = i.rng || Math.random
  }

  public abstract scores(): ScoreObject

  public abstract ranking(): string[][]
}
