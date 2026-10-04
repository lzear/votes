import { type Ballot, type Matrix, type Profile } from '../types'
import { matrixFromBallots, nonBlank, normalizeBallots } from '../utils'
import { type Matrixer } from './matrix-score-method'
import { Method, type Ranker } from './method'

export abstract class BallotMethod<C extends string>
  extends Method<C>
  implements Ranker<C>, Matrixer<C>
{
  private _matrix?: Matrix<C>
  // The subclass's own constructor options (tieBreakers, rng, …), which
  // restrict() passes back.
  private readonly options: object
  protected readonly ballots: Ballot<C>[]
  protected readonly unrankedLast: boolean
  protected readonly countBlank: boolean

  constructor({ ballots, candidates, ...options }: Profile<C>) {
    super(candidates)
    this.options = options
    this.unrankedLast = options.unrankedLast ?? true
    this.countBlank = options.countBlank ?? false
    this.ballots = normalizeBallots(ballots, candidates, this.unrankedLast)
  }

  // The ballots cast in a race between `candidates`: blank ones only with
  // `countBlank`.
  protected castBallots(candidates: C[]): Ballot<C>[] {
    return this.countBlank ? this.ballots : nonBlank(this.ballots, candidates)
  }

  /**
   * Return a matrix of duels from all the ballots
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
   * Return a new instance of the same method restricted to a subset of candidates.
   * Ballots are filtered to remove candidates not in the subset; unranked candidates
   * are NOT appended (preserves only opinions voters expressed).
   */
  restrict<D extends C>(candidates: D[]): BallotMethod<D> {
    type Ctor = new (input: Profile<D>) => BallotMethod<D>
    return new (this.constructor as Ctor)({
      ...this.options,
      ballots: normalizeBallots(this.ballots as Ballot<D>[], candidates, false),
      candidates,
    })
  }
}
