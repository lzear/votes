import type { Ballot, Matrix } from '../types'
import { matrixFromBallots } from '../utils/make-matrix'

import type { Matrixer } from './matrix-score-method'
import type { Scorer } from './score-method'
import { ScoreMethod } from './score-method'

export abstract class BallotScoreMethod
  extends ScoreMethod
  implements Scorer, Matrixer
{
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
