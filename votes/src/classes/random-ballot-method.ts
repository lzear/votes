import type { Ballot } from '../types'
import { BallotMethod } from './ballot-method'
import type { Ranker } from './method'

export abstract class RandomBallotMethod<C extends string>
  extends BallotMethod<C>
  implements Ranker<C>
{
  public static readonly isRandom = true

  protected readonly rng: () => number

  protected constructor(i: {
    candidates: C[]
    ballots: Ballot<C>[]
    rng?: undefined | (() => number)
  }) {
    super(i)

    this.rng = i.rng ?? Math.random
  }

  public abstract ranking(): C[][]
}
