import type { Ballot, Matrix } from '../types'
import { matrixFromBallots } from '../utils/make-matrix'
import type { Matrixer } from './matrix-score-method'
import type { Scorer } from './score-method'
import { ScoreMethod } from './score-method'

export abstract class BallotScoreMethod<C extends string>
  extends ScoreMethod<C>
  implements Scorer<C>, Matrixer<C>
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

  get matrix(): Matrix<C> {
    this._matrix ??= matrixFromBallots(this.ballots, this.candidates)

    return this._matrix
  }
}
