import { RandomMethod } from '../../classes/random-method'
import type { ScoreObject } from '../../types'
import { scoresAny } from '../../utils/scores-zero'
import { shuffleArray } from '../../utils/shuffle-array'

/**
 * Pick a candidate at random, regardless of the ballots
 */
export class RandomCandidates<C extends string> extends RandomMethod<C> {
  public ranking(): C[][] {
    return shuffleArray(this.candidates, this.rng).map((c) => [c])
  }

  public scores(): ScoreObject<C> {
    return scoresAny(this.candidates, 1 / this.candidates.length)
  }
}
