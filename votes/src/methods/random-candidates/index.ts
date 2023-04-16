import zipObject from 'lodash/zipObject'

import { RandomMethod } from '../../classes/random-method'
import type { ScoreObject } from '../../types'
import { shuffleArray } from '../../utils/shuffle-array'

/**
 * Pick a candidate at random, regardless of the ballots
 */
export class RandomCandidates extends RandomMethod {
  public ranking(): string[][] {
    return shuffleArray(this.candidates, this.rng).map((c) => [c])
  }

  public scores(): ScoreObject {
    return zipObject(
      this.candidates,
      new Array(this.candidates.length).fill(1 / this.candidates.length),
    )
  }
}
