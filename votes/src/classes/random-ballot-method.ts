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

  constructor(i: Profile<C> & { rng?: undefined | (() => number) }) {
    super(i)

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
}
