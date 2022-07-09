import type { Matrix } from '../types'
import { ScoreMethod, Scorer } from './score-method'

export interface Matrixer {
  matrix: Matrix
}

export abstract class MatrixScoreMethod
  extends ScoreMethod
  implements Scorer, Matrixer
{
  public static readonly needsMatrix = true
  private readonly _matrix: Matrix

  constructor(i: Matrix) {
    super(i.candidates)
    this._matrix = {
      array: i.array,
      candidates: i.candidates,
    }
  }

  get matrix(): Matrix {
    return this._matrix
  }
}
