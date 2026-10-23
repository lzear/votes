import type { Matrix, Profile, ScoreObject } from '../types'
import { deepFreeze } from '../utils/freeze'
import { subMatrix, toMatrix } from '../utils/make-matrix'
import { shuffleArray } from '../utils/shuffle-array'
import { sum } from '../utils/sum'
import type { Matrixer } from './matrix-score-method'
import { RandomMethod } from './random-method'

// Draws candidates one at a time, each with probability proportional to its
// score among those not yet drawn.
const randomRankingFromScores = <C extends string>(
  scores: ScoreObject<C>,
  random: () => number,
): C[] => {
  const left = Object.keys(scores) as C[]
  const ranking: C[] = []
  while (left.length > 1) {
    const total = sum(left.map((c) => scores[c]))
    if (total <= 0) return [...ranking, ...shuffleArray(left, random)]

    // `>`, or a score of 0 is drawn when `random()` gives 0. Unnormalized,
    // so `w` ends at exactly `total`; past it, when `random()` gives 1, the
    // last candidate with a score.
    const pickAt = random() * total
    let w = 0
    const i = left.findIndex((c) => {
      w += scores[c]
      return w > pickAt
    })
    ranking.push(
      ...left.splice(
        i === -1 ? left.findLastIndex((c) => scores[c] > 0) : i,
        1,
      ),
    )
  }
  return [...ranking, ...left]
}

export abstract class RandomMatrixMethod<C extends string>
  extends RandomMethod<C>
  implements Matrixer<C>
{
  private readonly _matrix: Matrix<C>

  constructor(
    i: (Matrix<C> | Profile<C>) & { rng?: (() => number) | undefined },
  ) {
    super(i)

    this._matrix = deepFreeze(toMatrix(i))
  }

  get matrix(): Matrix<C> {
    return this._matrix
  }

  public abstract override probabilities(): ScoreObject<C>

  /**
  @internal
  */
  protected draw(): C[][] {
    return randomRankingFromScores(this.probabilities(), this.rng).map((c) => [
      c,
    ])
  }

  public override restrict(candidates: readonly C[]): this {
    type Ctor = new (
      i: Matrix<C> & { rng?: (() => number) | undefined },
    ) => this
    return new (this.constructor as Ctor)({
      ...subMatrix(this.matrix, candidates),
      rng: this.rng,
    })
  }
}
