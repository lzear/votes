import type { Ballot, Matrix } from '../types'
import { normalizeBallots } from '../utils'
import { matrixFromBallots } from '../utils/make-matrix'
import type { Matrixer } from './matrix-score-method'
import { Method, type Ranker } from './method'

export abstract class BallotMethod<C extends string>
  extends Method<C>
  implements Ranker<C>, Matrixer<C>
{
  public static readonly needsBallot = true
  protected readonly ballots: Ballot<C>[]
  private _matrix?: Matrix<C>

  constructor({
    ballots,
    candidates,
  }: {
    ballots: Ballot<C>[]
    candidates: C[]
  }) {
    super(candidates)
    this.ballots = ballots
  }

  /**
   * Return a matrix of duels from all the ballots
   */
  get matrix(): Matrix<C> {
    this._matrix ??= matrixFromBallots(this.ballots, this.candidates)

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
      ballots: normalizeBallots(this.ballots as Ballot<D>[], candidates),
      candidates,
    })
  }
}
