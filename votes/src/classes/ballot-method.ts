import { type Ballot, type Matrix } from '../types'
import { matrixFromBallots, normalizeBallots } from '../utils'
import { type Matrixer } from './matrix-score-method'
import { Method, type Ranker } from './method'

export abstract class BallotMethod<C extends string>
  extends Method<C>
  implements Ranker<C>, Matrixer<C>
{
  public static readonly needsBallot = true
  private _matrix?: Matrix<C>
  // The subclass's own constructor options (tieBreakers, rng, …), which
  // restrict() passes back.
  private readonly options: object
  protected readonly ballots: Ballot<C>[]
  protected readonly unrankedLast: boolean

  constructor({
    ballots,
    candidates,
    ...options
  }: {
    ballots: Ballot<C>[]
    candidates: C[]
    /**
     * Whether candidates a ballot leaves unranked are appended to it as one
     * tied bottom tier (default true — the classic "pessimistic" completion
     * of partial ballots). Pass false to score only what voters expressed:
     * unranked candidates then earn nothing from that ballot (no Borda
     * points, no transfers, no last-place counts).
     */
    unrankedLast?: boolean
  }) {
    super(candidates)
    this.options = options
    this.unrankedLast = options.unrankedLast ?? true
    this.ballots = normalizeBallots(ballots, candidates, this.unrankedLast)
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
    type Ctor = new (input: {
      ballots: Ballot<D>[]
      candidates: D[]
    }) => BallotMethod<D>
    return new (this.constructor as Ctor)({
      ...this.options,
      ballots: normalizeBallots(this.ballots as Ballot<D>[], candidates, false),
      candidates,
    })
  }
}
