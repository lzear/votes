import type { Matrix, ScoreObject } from '../../types'
import { Minimax, MinimaxVariant } from '../minimax'
import { findSmithSet } from '../../utils/condorcet'
import { scoresAny } from '../../utils/scores-zero'
import _ from 'lodash'

const computeScores = (
  matrix: Matrix,
  variant: MinimaxVariant,
  excludeTies: boolean,
): ScoreObject => {
  const minimax = new Minimax({ ...matrix, variant, excludeTies })
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

/**
 * Requested in https://github.com/lzear/votes/issues/76
 *
 * The Minimax-TD process:
 * 1. Do the pairwise comparisons using Margins (the number of voters ranking X above Y minus the number of voters ranking Y above X. )
 * 1. Find the [Smith Set](https://en.wikipedia.org/wiki/Smith_set), the smallest non-empty set of candidates such that each member defeats every candidate outside the set in a pairwise comparison. [That Algorithm may be found here.](https://electowiki.org/wiki/Maximal_elements_algorithms)
 * 1. If there is one member of the Smith set, that is the winner.
 * 1. If there are multiple members of the Smith set, using Margins [Minimax method](https://en.wikipedia.org/wiki/Minimax_Condorcet_method), the candidate in the Smith set with the lowest 'worst pairwise defeat' (which can be negative, equivalent to the lowest 'worst pairwise victory' if there are no defeats) is the winner. See examples below...
 * 1. Remove the winner and repeat the process to find each successive place (2nd, 3rd, etc)
 *
 * #### Example 1:
 *
 * A, B, and C are the members of the Smith set.
 *
 * - A beat B: 58% to 42%. (16% margin)
 * - B beat C: 68% to 32% (36% margin)
 * - C beat A: 70% to 30%. (40% margin)
 * - A beat D: 55% to 45%. (10% margin)
 * - B beat D: 60% to 40%. (20% margin)
 * - C beat D: 99% to 1%. (98% margin)
 *
 * Look for the lowest 'worst pairwise defeat' in all of the comparisons (not just within the smith set):
 * - A's 'worst pairwise defeat' is 40% margin against C (70%-30%)
 * - B's 'worst pairwise defeat' is 16% margin against A (58%-42%)
 * - C's 'worst pairwise defeat' is 36% margin against B (68%-32%)
 *
 * B has the smallest 'worst pairwise defeat', therefore B is the winner.
 *
 * #### Example 2:
 *
 * A and B are the members of the Smith set. Both of them beat every other candidate but they tied each other.
 * - A tied B: 50% to 50% (0% margin)
 * - A beat C: 68% to 32% (36% margin)
 * - A beat D: 99% to 1% (98% margin)
 * - B beat C: 70% to 30% (40% margin)
 * - B beat D: 60% to 40% (20% margin)
 * - C beat D: 55% to 45% (10% margin)
 *
 * Look for the lowest 'worst pairwise defeat', and since there are no defeats, look for the lowest 'worst pairwise victory' (not just within the smith set):
 * - A's 'worst pairwise victory' is -36% margin against C (32% -68%)
 * - B's 'worst pairwise victory' is -20% margin against C (40% -60%)
 *
 * A has the lowest "worst pairwise victory" against all the candidates, therefore A is the winner.
 */
export class MinimaxTD extends Minimax {
  public scores(): ScoreObject {
    return computeScores(this.matrix, this.minimaxVariant, this.excludeTies)
  }
}
