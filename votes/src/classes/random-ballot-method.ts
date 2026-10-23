import type { Profile, Ranking, ScoreObject } from '../types'
import { deepFreeze } from '../utils/freeze'
import { BallotMethod } from './ballot-method'
import type { Ranker } from './method'

export abstract class RandomBallotMethod<C extends string>
  extends BallotMethod<C>
  implements Ranker<C>
{
  public static override readonly isRandom = true

  private _ranking?: Ranking<C>
  /**
  @internal
  */
  protected readonly rng: () => number

  constructor(
    i: Profile<C> & {
      /**
      Random number generator, giving numbers from 0 to 1 (default
      `Math.random`). Pass `rngGenerator(seed)` for draws that repeat.
      */
      rng?: undefined | (() => number)
    },
  ) {
    super(i)

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
}
