import { type Profile } from '../types'
import { BallotMethod } from './ballot-method'
import { type Ranker } from './method'

export abstract class RandomBallotMethod<C extends string>
  extends BallotMethod<C>
  implements Ranker<C>
{
  public static override readonly isRandom = true

  private _ranking?: C[][]
  protected readonly rng: () => number

  constructor(i: Profile<C> & { rng?: undefined | (() => number) }) {
    super(i)

    this.rng = i.rng ?? Math.random
  }

  // Drawn once: every call returns the same ranking.
  public ranking(): C[][] {
    this._ranking ??= this.draw()
    return this._ranking
  }

  protected abstract draw(): C[][]
}
