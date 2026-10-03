import { type Profile } from '../types'
import { BallotMethod } from './ballot-method'
import { type Ranker } from './method'

export abstract class RandomBallotMethod<C extends string>
  extends BallotMethod<C>
  implements Ranker<C>
{
  public static override readonly isRandom = true

  protected readonly rng: () => number

  constructor(i: Profile<C> & { rng?: undefined | (() => number) }) {
    super(i)

    this.rng = i.rng ?? Math.random
  }

  public abstract override ranking(): C[][]
}
