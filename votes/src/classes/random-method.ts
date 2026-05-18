import type { ScoreObject } from '../types'
import { Method } from './method'
import type { Scorer } from './score-method'

/**
 * Voting method that involves some randomness in the computation in the winners.
 */
export abstract class RandomMethod<C extends string>
  extends Method<C>
  implements Scorer<C>
{
  public static readonly isRandom = true

  protected readonly rng: () => number

  constructor(i: { candidates: C[]; rng?: () => number }) {
    super(i.candidates)

    this.rng = i.rng ?? Math.random
  }

  public abstract scores(): ScoreObject<C>

  public abstract ranking(): C[][]

  restrict<D extends C>(candidates: D[]): Method<D> {
    type Ctor = new (i: {
      candidates: D[]
      rng?: () => number
    }) => RandomMethod<D>
    return new (this.constructor as Ctor)({ candidates, rng: this.rng })
  }
}
