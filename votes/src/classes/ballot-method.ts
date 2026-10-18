import type { Ballot, Matrix, Profile } from '../types'
import { matrixFromBallots, nonBlank, normalizeBallots } from '../utils'
import type { Matrixer } from './matrix-score-method'
import { Method, type Ranker } from './method'

const sameRanking = <C extends string>(
  a: Ballot<C>,
  b: Ballot<C> | undefined,
): boolean =>
  a.ranking.length === b?.ranking.length &&
  a.ranking.every((tier, i) => {
    const other = b.ranking[i]
    return tier.length === other?.length && tier.every((c, j) => c === other[j])
  })

export abstract class BallotMethod<C extends string>
  extends Method<C>
  implements Ranker<C>, Matrixer<C>
{
  private _matrix?: Matrix<C>
  // The subclass's own constructor options (tieBreakers, rng, …), which
  // restrict() passes back.
  private readonly options: object
  // The ballots as given, which restrict() counts afresh.
  private input: readonly Ballot<C>[] = []
  protected readonly ballots: Ballot<C>[]
  protected readonly unrankedLast: boolean
  protected readonly countBlank: boolean

  constructor({ ballots, candidates, ...options }: Profile<C>) {
    super(candidates)
    this.options = options
    this.unrankedLast = options.unrankedLast ?? true
    this.countBlank = options.countBlank ?? false
    this.ballots = normalizeBallots(ballots, candidates, this.unrankedLast)
    this.keepInput(ballots)
  }

  /**
  Keeps `ballots` as given, for restrict() to count afresh: `this.ballots`
  instead when they rank the same, to hold one array.
  */
  protected keepInput(ballots: readonly Ballot<C>[]): void {
    this.input = this.ballots.every((b, i) => sameRanking(b, ballots[i]))
      ? this.ballots
      : ballots
  }

  // The ballots cast in a race between `candidates`: blank ones only with
  // `countBlank`.
  protected castBallots(candidates: C[]): Ballot<C>[] {
    return this.countBlank ? this.ballots : nonBlank(this.ballots, candidates)
  }

  /**
  Return a matrix of duels from all the ballots
  */
  get matrix(): Matrix<C> {
    this._matrix ??= matrixFromBallots(
      this.ballots,
      this.candidates,
      this.unrankedLast,
    )
    return this._matrix
  }

  /**
  Return a new instance of the same method restricted to a subset of
  candidates: the same method, run afresh on the ballots as given, as if
  only `candidates` ran. A ballot ranking none of them is blank.
  */
  restrict(candidates: readonly C[]): this {
    type Ctor = new (input: Profile<C>) => this
    return new (this.constructor as Ctor)({
      ...this.options,
      ballots: this.input,
      candidates,
    })
  }
}
