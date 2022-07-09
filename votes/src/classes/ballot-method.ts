import type { Ballot, Matrix } from '../types'
import { Method, Ranker } from './method'
import { matrixFromBallots } from '../utils/make-matrix'

export abstract class BallotMethod extends Method implements Ranker {
  public static readonly needsBallot = true
  protected readonly ballots: Ballot[]
  private _matrix?: Matrix

  constructor({
    ballots,
    candidates,
  }: {
    ballots: Ballot[]
    candidates: string[]
  }) {
    super(candidates)
    this.ballots = ballots
  }

  get matrix(): Matrix {
    if (!this._matrix)
      this._matrix = matrixFromBallots(this.ballots, this.candidates)

    return this._matrix
  }
}
