import type { Ballot, Matrix } from '../types'
import { matrixFromBallots } from '../utils/make-matrix'

import type { Ranker } from './method'
import { Method } from './method'

export abstract class BallotMethod extends Method implements Ranker {
  public static readonly needsBallot = true
  protected readonly ballots: Ballot[]
  private _matrix?: Matrix

  /**
   * @param ballots - ballots cast by the voters
   * @param candidates - canidates to consider
   */
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

  /**
   * Return a matrix of duels from all the ballots
   */
  get matrix(): Matrix {
    if (!this._matrix)
      this._matrix = matrixFromBallots(this.ballots, this.candidates)

    return this._matrix
  }
}
