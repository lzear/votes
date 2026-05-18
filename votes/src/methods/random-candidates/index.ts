import { zipObject } from 'lodash-es'
import { RandomMethod } from '../../classes/random-method'
import type { ScoreObject } from '../../types'
import { shuffleArray } from '../../utils/shuffle-array'

/**
 * Pick a candidate at random, regardless of the ballots
 */
export class RandomCandidates<C extends string> extends RandomMethod<C> {
  public ranking(): C[][] {
    return shuffleArray(this.candidates, this.rng).map((c) => [c])
  }

  public scores(): ScoreObject<C> {
    return zipObject(
      this.candidates,
      Array.from({ length: this.candidates.length }).fill(
        1 / this.candidates.length,
      ),
    ) as ScoreObject<C>
  }
}
