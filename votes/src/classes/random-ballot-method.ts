import { type Ballot } from '../types'
import { normalizeBallots } from '../utils'
import { BallotMethod } from './ballot-method'
import { type Ranker } from './method'

export abstract class RandomBallotMethod<C extends string>
  extends BallotMethod<C>
  implements Ranker<C>
{
  public static readonly isRandom = true

  protected readonly rng: () => number

  constructor(i: {
    candidates: C[]
    ballots: Ballot<C>[]
    rng?: undefined | (() => number)
    unrankedLast?: boolean
  }) {
    super(i)

    this.rng = i.rng ?? Math.random
  }

  public abstract ranking(): C[][]

  // BallotMethod#restrict would drop the rng; keep it so restricted runs
  // stay deterministic under a seeded generator.
  public restrict<D extends C>(candidates: D[]): RandomBallotMethod<D> {
    type Ctor = new (input: {
      ballots: Ballot<D>[]
      candidates: D[]
      rng?: () => number
      unrankedLast?: boolean
    }) => RandomBallotMethod<D>
    return new (this.constructor as Ctor)({
      ballots: normalizeBallots(this.ballots as Ballot<D>[], candidates, false),
      candidates,
      rng: this.rng,
      unrankedLast: this.unrankedLast,
    })
  }
}
