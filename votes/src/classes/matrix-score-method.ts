import { type Matrix } from '../types'
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
  // The subclass's own constructor options (Minimax's variant, …), which
  // restrict() passes back.
  private readonly options: object

  constructor({ array, candidates, ...options }: Matrix<C>) {
    super(candidates)
    this._matrix = { array, candidates }
    this.options = options
  }

  get matrix(): Matrix<C> {
    return this._matrix
  }

  restrict<D extends C>(candidates: D[]): MatrixScoreMethod<D> {
    type Ctor = new (matrix: Matrix<D>) => MatrixScoreMethod<D>
    return new (this.constructor as Ctor)({
      ...this.options,
      ...subMatrix(this.matrix, candidates),
    })
  }
}
