import type { Matrix } from '../types'
import type { Scorer } from './score-method'
import { ScoreMethod } from './score-method'

export interface Matrixer<C extends string> {
  matrix: Matrix<C>
}

export abstract class MatrixScoreMethod<C extends string>
  extends ScoreMethod<C>
  implements Scorer<C>, Matrixer<C>
{
  public static readonly needsMatrix = true
  private readonly _matrix: Matrix<C>

  constructor(i: Matrix<C>) {
    super(i.candidates)
    this._matrix = {
      array: i.array,
      candidates: i.candidates,
    }
  }

  get matrix(): Matrix<C> {
    return this._matrix
  }
}
