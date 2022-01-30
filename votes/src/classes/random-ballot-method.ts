import { Ranker } from './method'
import { Ballot } from '../types'
import { BallotMethod } from './ballot-method'

export abstract class RandomBallotMethod
  extends BallotMethod
  implements Ranker
{
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
