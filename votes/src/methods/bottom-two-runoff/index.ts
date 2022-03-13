import _ from 'lodash'
import { Ballot, ScoreObject } from '../../types'
import { scoresAny } from '../../utils/scores-zero'
import { RoundBallotMethod } from '../../classes/round-ballot-method'
import { Copeland } from '../copeland'
import { matrixFromBallots, normalizeBallots } from '../../utils'
import { BiggestSupport } from '../biggest-support'

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

    const leastSupport = biggestSupport.at(-1)

    const bottom = []
    if (leastSupport) bottom.push(...leastSupport)
    if (bottom.length === 1) {
      const leastSupport2 = biggestSupport.at(-2)
      if (leastSupport2) bottom.push(...leastSupport2)
    }

    const eliminated = this.copeland.tieBreak([bottom]).at(-1)

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
