import { type Matrix, type ScoreObject } from '../types'
import { subMatrix } from '../utils/make-matrix'
import { shuffleArray } from '../utils/shuffle-array'
import { sum } from '../utils/sum'
import { type Matrixer } from './matrix-score-method'
import { RandomMethod } from './random-method'
import { type Scorer } from './score-method'

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
    // so `w` ends at exactly `total`.
    const pickAt = random() * total
    let w = 0
    const i = left.findIndex((c) => {
      w += scores[c]
      return w > pickAt
    })
    ranking.push(...left.splice(i === -1 ? -1 : i, 1))
  }
  return [...ranking, ...left]
}

export abstract class RandomMatrixMethod<C extends string>
  extends RandomMethod<C>
  implements Scorer<C>, Matrixer<C>
{
  public static override readonly needsMatrix = true

  private readonly _matrix: Matrix<C>

  constructor(i: Matrix<C> & { rng?: () => number }) {
    super(i)

    this._matrix = {
      array: i.array,
      candidates: i.candidates,
    }
  }

  get matrix(): Matrix<C> {
    return this._matrix
  }

  public abstract override scores(): ScoreObject<C>

  public ranking(): C[][] {
    return randomRankingFromScores(this.scores(), this.rng).map((c) => [c])
  }

  public override restrict<D extends C>(
    candidates: D[],
  ): RandomMatrixMethod<D> {
    type Ctor = new (
      i: Matrix<D> & { rng?: () => number },
    ) => RandomMatrixMethod<D>
    return new (this.constructor as Ctor)({
      ...subMatrix(this.matrix, candidates),
      rng: this.rng,
    })
  }
}
