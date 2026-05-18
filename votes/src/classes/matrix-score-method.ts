import type { Matrix } from '../types'
import { subMatrix } from '../utils/make-matrix'
import { ScoreMethod, type Scorer } from './score-method'

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

  restrict<D extends C>(candidates: D[]): MatrixScoreMethod<D> {
    type Ctor = new (matrix: Matrix<D>) => MatrixScoreMethod<D>
    return new (this.constructor as Ctor)(subMatrix(this.matrix, candidates))
  }
}
