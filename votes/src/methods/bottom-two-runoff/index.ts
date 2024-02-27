import _ from 'lodash-es'

import { RoundBallotMethod } from '../../classes/round-ballot-method'
import type { Ballot, ScoreObject } from '../../types'
import { arrayAt } from '../../utils/array-at'
import { matrixFromBallots } from '../../utils/make-matrix'
import { normalizeBallots } from '../../utils/normalize'
import { scoresAny } from '../../utils/scores-zero'
import { BiggestSupport } from '../biggest-support'
import { Copeland } from '../copeland'

/**
 * #### Electowiki: [Bottom-Two-Runoff IRV](https://electowiki.org/wiki/Bottom-Two-Runoff_IRV)
 */
export class BottomTwoRunoff extends RoundBallotMethod {
  private copeland: Copeland
  constructor(i: { ballots: Ballot[]; candidates: string[] }) {
    super(i)
    this.copeland = new Copeland(matrixFromBallots(i.ballots, i.candidates))
  }

  protected round(candidates: string[]): {
    qualified: string[]
    eliminated: string[]
    scores: ScoreObject
  } {
    const biggestSupport = new BiggestSupport({
      ballots: normalizeBallots(this.ballots, candidates),
      candidates,
    }).ranking()

    const leastSupport = arrayAt(biggestSupport, -1)

    const bottom = []
    if (leastSupport) bottom.push(...leastSupport)
    if (bottom.length === 1) {
      const leastSupport2 = arrayAt(biggestSupport, -2)
      if (leastSupport2) bottom.push(...leastSupport2)
    }

    const eliminated = arrayAt(this.copeland.tieBreak([bottom]), -1)

    if (!eliminated || eliminated.length === 0)
      throw new Error('Unexpected round result!')

    return {
      eliminated,
      qualified: _.difference(candidates, eliminated),
      scores: {
        ...scoresAny(candidates, 2),
        ...scoresAny(bottom, 1),
        ...scoresAny(eliminated, 0),
      },
    }
  }
}
