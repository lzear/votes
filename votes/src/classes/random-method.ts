import type { Profile, Ranking, ScoreObject } from '../types'
import { deepFreeze } from '../utils/freeze'
import { Method } from './method'

/**
Voting method that involves some randomness in the computation in the winners.
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
      rng?: (() => number) | undefined
    },
  ) {
    super(i.candidates)

    this.rng = i.rng ?? Math.random
  }

  // Each candidate's chance to win.
  public abstract probabilities(): ScoreObject<C>

  // Drawn once: every call returns the same ranking.
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
