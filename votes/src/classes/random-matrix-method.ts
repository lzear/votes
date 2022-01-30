import { Scorer } from './score-method'
import { Matrix, ScoreObject } from '../types'
import { RandomMethod } from './random-method'
import { Matrixer } from './matrix-score-method'
import _ from 'lodash'
import { shuffleArray } from '../utils/shuffle-array'

const randomRankingFromSores = (
  scoreObject: ScoreObject,
  random: () => number,
): string[] => {
  const candidates = Object.keys(scoreObject)
  if (candidates.length < 2) return candidates

  const sumScores = _.sum(Object.values(scoreObject))

  if (sumScores <= 0) return shuffleArray(candidates, random)

  const normalizedScoreObject = _.mapValues(scoreObject, (s) => s / sumScores)

  const pickAt = random()
  let w = 0

  for (const candidate of candidates) {
    w += normalizedScoreObject[candidate]
    if (w >= pickAt)
      return [
        candidate,
        ...randomRankingFromSores(_.omit(scoreObject, candidate), random),
      ]
  }

  throw new Error('Unable to generate random ranking from scores')
}

export abstract class RandomMatrixMethod
  extends RandomMethod
  implements Scorer, Matrixer
{
  private readonly _matrix: Matrix

  constructor(i: Matrix & { rng?: () => number }) {
    super(i)

    this._matrix = {
      array: i.array,
      candidates: i.candidates,
    }
  }

  get matrix(): Matrix {
    return this._matrix
  }

  public abstract scores(): ScoreObject

  public ranking(): string[][] {
    return randomRankingFromSores(this.scores(), this.rng).map((c) => [c])
  }
}
