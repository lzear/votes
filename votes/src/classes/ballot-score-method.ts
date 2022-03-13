import { Ballot, Matrix } from '../types'
import { matrixFromBallots } from '../utils'
import { ScoreMethod, Scorer } from './score-method'
import { Matrixer } from './matrix-score-method'

export abstract class BallotScoreMethod
  extends ScoreMethod
  implements Scorer, Matrixer
{
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