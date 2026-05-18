import type { ScoreObject } from '../types'
import { scoresZero } from '../utils'
import { BallotMethod } from './ballot-method'
import type { Ranker } from './method'

export interface QE<C extends string> {
  qualified: C[]
  eliminated: C[]
  scores: ScoreObject<C>
}

export interface Round<C extends string> {
  finished: boolean
  idx: number
  candidates: C[]
  roundResult: {
    eliminated: C[]
    qualified: C[]
    scores: ScoreObject<C>
    tieBreakSteps?: C[][]
  }
}

/**
 * Voting system in which candidates are iteratively eliminated.
 */
export abstract class RoundBallotMethod<C extends string>
  extends BallotMethod<C>
  implements Ranker<C>
{
  public computeRounds(): Round<C>[] {
    let inRace = this.candidates
    const rounds: Round<C>[] = []
    while (inRace.length > 0) {
      const idx = rounds.length
      const { qualified, eliminated, scores } = this.round(inRace, idx)
      rounds.push({
        idx,
        candidates: inRace,
        finished: inRace.length <= 1,
        roundResult: { qualified, eliminated, scores },
      })
      inRace = qualified
    }
    return rounds
  }

  public ranking(): C[][] {
    return this.computeRounds()
      .toReversed()
      .map((r) => r.roundResult.eliminated)
      .filter((eliminated) => eliminated.length > 0)
  }

  protected abstract round(candidates: C[], idx: number): QE<C>

  protected roundScoresZero(candidates: C[]): ScoreObject<C> {
    return scoresZero(candidates)
  }
}
