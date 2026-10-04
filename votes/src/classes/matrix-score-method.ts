import { type Matrix, type Profile } from '../types'
import { subMatrix, toMatrix } from '../utils/make-matrix'
import { ScoreMethod, type Scorer } from './score-method'

export interface Matrixer<C extends string> {
  matrix: Matrix<C>
}

/**
 * Score method for which the matrix of duels is enough: it takes one, or
 * builds it from ballots.
 */
export abstract class MatrixScoreMethod<C extends string>
  extends ScoreMethod<C>
  implements Scorer<C>, Matrixer<C>
{
  private readonly _matrix: Matrix<C>
  // With the subclass's own options (Minimax's variant, …), which restrict()
  // passes back along with a smaller matrix.
  private readonly input: Matrix<C> | Profile<C>

  constructor(input: Matrix<C> | Profile<C>) {
    super(input.candidates)
    this._matrix = toMatrix(input)
    this.input = input
  }

  get matrix(): Matrix<C> {
    return this._matrix
  }

  restrict(candidates: readonly C[]): this {
    type Ctor = new (matrix: Matrix<C>) => this
    return new (this.constructor as Ctor)({
      ...this.input,
      ...subMatrix(this.matrix, candidates),
    })
  }
}
