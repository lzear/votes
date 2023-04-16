import type { Ballot } from '../types'

import { BallotMethod } from './ballot-method'
import type { Ranker } from './method'

export abstract class RandomBallotMethod
  extends BallotMethod
  implements Ranker
{
  public static readonly isRandom = true

  protected readonly rng: () => number

  protected constructor(i: {
    candidates: string[]
    ballots: Ballot[]
    rng?: () => number
  }) {
    super(i)

    this.rng = i.rng || Math.random
  }

  public abstract ranking(): string[][]
}
