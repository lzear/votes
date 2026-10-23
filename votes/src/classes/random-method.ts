import type { Profile, Ranking, ScoreObject } from '../types'
import { deepFreeze } from '../utils/freeze'
import { Method } from './method'

/**
Voting method that draws its ranking at random.
*/
export abstract class RandomMethod<C extends string> extends Method<C> {
  public static override readonly isRandom = true

  private _ranking?: Ranking<C>
  /**
  @internal
  */
  protected readonly rng: () => number

  constructor(
    i: Partial<Profile<C>> & {
      candidates: readonly C[]
      /**
      Random number generator, giving numbers from 0 to 1 (default
      `Math.random`). Pass `rngGenerator(seed)` for draws that repeat.
      */
      rng?: (() => number) | undefined
    },
  ) {
    super(i.candidates)

    this.rng = i.rng ?? Math.random
  }

  /**
  Each candidate's chance to win, from 0 to 1, summing to 1.
  */
  public abstract probabilities(): ScoreObject<C>

  /**
  A ranking drawn at random with `rng`, once: every call returns the same
  one.
  */
  public ranking(): Ranking<C> {
    this._ranking ??= deepFreeze(this.draw())
    return this._ranking
  }

  /**
  @internal
  */
  protected abstract draw(): Ranking<C>

  restrict(candidates: readonly C[]): this {
    type Ctor = new (i: {
      candidates: readonly C[]
      rng?: (() => number) | undefined
    }) => this
    return new (this.constructor as Ctor)({ candidates, rng: this.rng })
  }
}
