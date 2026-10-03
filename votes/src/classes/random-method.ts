import { type Profile, type ScoreObject } from '../types'
import { Method } from './method'

/**
 * Voting method that involves some randomness in the computation in the winners.
 */
export abstract class RandomMethod<C extends string> extends Method<C> {
  public static override readonly isRandom = true

  protected readonly rng: () => number

  constructor(
    i: Partial<Profile<C>> & {
      candidates: C[]
      rng?: (() => number) | undefined
    },
  ) {
    super(i.candidates)

    this.rng = i.rng ?? Math.random
  }

  // Each candidate's chance to win.
  public abstract probabilities(): ScoreObject<C>

  public abstract override ranking(): C[][]

  restrict<D extends C>(candidates: D[]): Method<D> {
    type Ctor = new (i: {
      candidates: D[]
      rng?: () => number
    }) => RandomMethod<D>
    return new (this.constructor as Ctor)({ candidates, rng: this.rng })
  }
}
