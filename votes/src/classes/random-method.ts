import type { ScoreObject } from '../types'

import { Method } from './method'
import type { Scorer } from './score-method'

/**
 * Voting method that involves some randomness in the computation in the winners.
 */
export abstract class RandomMethod extends Method implements Scorer {
  public static readonly isRandom = true

  protected readonly rng: () => number

  constructor(i: { candidates: string[]; rng?: () => number }) {
    super(i.candidates)

    this.rng = i.rng || Math.random
  }

  public abstract scores(): ScoreObject

  public abstract ranking(): string[][]
}
