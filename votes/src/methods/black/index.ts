import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { ScoreObject } from '../../types'
import { findSmithSet } from '../../utils'
import { bordaScores } from '../borda'

/**
The Condorcet winner, or else the Borda winner. The others rank by Borda
score, which `scores()` returns.

#### Wikipedia: [Black's method](https://en.wikipedia.org/wiki/Black%27s_method)
*/
export class Black<C extends string> extends BallotScoreMethod<C> {
  public static readonly label = 'Black'

  public scores(): ScoreObject<C> {
    return bordaScores(this.ballots, this.candidates)
  }

  public override ranking(): C[][] {
    const ranking = super.ranking()
    // A Smith set of one is a Condorcet winner.
    const [winner, ...others] = findSmithSet(this.matrix).candidates
    if (winner === undefined || others.length > 0) return ranking
    return [
      [winner],
      ...ranking
        .map((tier) => tier.filter((c) => c !== winner))
        .filter((tier) => tier.length > 0),
    ]
  }
}
