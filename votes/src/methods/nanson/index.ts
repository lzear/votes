import { type QE } from '../../classes/round-ballot-method'
import { RoundBallotMethodTb } from '../../classes/round-ballot-method-tb'
import { config } from '../../utils/config'
import { sum } from '../../utils/sum'
import { bordaScores } from '../borda'

// Round-level detail specific to Nanson: the Borda-score cutoff used to eliminate candidates.
export interface NansonInfo {
  average: number
}

/**
 * #### Wikipedia: [Nanson's method](https://en.wikipedia.org/wiki/Nanson%27s_method)
 */
export class Nanson<C extends string> extends RoundBallotMethodTb<
  C,
  NansonInfo
> {
  protected round(candidates: C[]): QE<C, NansonInfo> {
    const scores = bordaScores(this.ballots, candidates)
    const values = Object.values<number>(scores)
    const avg = sum(values) / values.length
    const info = { average: avg }

    const qualified = candidates.filter((c) => scores[c] > avg + config.EPSILON)
    const eliminated = candidates.filter(
      (c) => scores[c] <= avg + config.EPSILON,
    )

    if (qualified.length > 0) return { qualified, eliminated, scores, info }

    // Everyone is at the average: a complete tie, left to the tiebreakers.
    const tied = this.resolvePending(candidates)
    return {
      qualified: tied.qualified,
      eliminated: tied.eliminated,
      scores,
      info,
      ...(tied.tieBreakSteps.length > 0 && {
        tieBreakSteps: tied.tieBreakSteps,
      }),
    }
  }
}
