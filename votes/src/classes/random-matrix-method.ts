/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mapValues, omit, sum } from 'lodash-es'
import type { Matrix, ScoreObject } from '../types'
import { subMatrix } from '../utils/make-matrix'
import { shuffleArray } from '../utils/shuffle-array'
import type { Matrixer } from './matrix-score-method'
import { RandomMethod } from './random-method'
import type { Scorer } from './score-method'

const randomRankingFromSores = <C extends string>(
  scoreObject: ScoreObject<C>,
  random: () => number,
): C[] => {
  const candidates = Object.keys(scoreObject) as C[]
  if (candidates.length < 2) return candidates

  const sumScores = sum(Object.values(scoreObject))

  if (sumScores <= 0) return shuffleArray(candidates, random)

  const normalizedScoreObject = mapValues(scoreObject, (s) => s / sumScores)

  const pickAt = random()
  let w = 0

  for (const candidate of candidates) {
    w += normalizedScoreObject[candidate]
    if (w >= pickAt)
      return [
        candidate,
        ...randomRankingFromSores(omit(scoreObject, candidate), random),
      ]
  }

  const last = candidates.at(-1)!
  return [last, ...randomRankingFromScores(omit(scoreObject, last), random)]
}

export abstract class RandomMatrixMethod<C extends string>
  extends RandomMethod<C>
  implements Scorer<C>, Matrixer<C>
{
  public static readonly needsMatrix = true

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

  public abstract scores(): ScoreObject<C>

  public ranking(): C[][] {
    return randomRankingFromSores(this.scores(), this.rng).map((c) => [c])
  }

  public restrict<D extends C>(candidates: D[]): RandomMatrixMethod<D> {
    type Ctor = new (
      i: Matrix<D> & { rng?: () => number },
    ) => RandomMatrixMethod<D>
    return new (this.constructor as Ctor)({
      ...subMatrix(this.matrix, candidates),
      rng: this.rng,
    })
  }
}
