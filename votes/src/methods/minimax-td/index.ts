import type { Matrix, ScoreObject } from '../../types'
import { MatrixScoreMethod } from '../../classes/matrix-score-method'
import { Minimax, MinimaxVariant } from '../minimax'
import { findSmithSet } from '../../utils/condorcet'
import { scoresAny } from '../../utils/scores-zero'
import _ from 'lodash'

const computeScores = (
  matrix: Matrix,
  variant: MinimaxVariant,
): ScoreObject => {
  const minimax = new Minimax({ ...matrix, variant })
  const smithSet = findSmithSet(matrix)
  const minimaxScores = minimax.scores()
  const smithSetScores = _.pick(minimaxScores, smithSet.candidates)
  const smithSetScoresMin = Math.min(...Object.values(smithSetScores))
  return {
    // give all non-Smith-set candidates a score worse than the worst of the Smith set
    ...scoresAny(matrix.candidates, Math.min(smithSetScoresMin, 0) * 2 - 1),
    ...smithSetScores,
  }
}

export class MinimaxTD extends MatrixScoreMethod {
  public minimaxVariant: MinimaxVariant

  public static Variants = MinimaxVariant

  constructor(i: Matrix & { variant?: MinimaxVariant }) {
    super(i)
    this.minimaxVariant = i.variant || MinimaxVariant.Margins
  }

  public scores(): ScoreObject {
    return computeScores(this.matrix, this.minimaxVariant)
  }
}
