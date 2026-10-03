import { type QE, type Round, type ScoreObject } from '../types'
import { scoresZero } from '../utils'
import { BallotMethod } from './ballot-method'
import { type Ranker } from './method'

/**
 * Voting system in which candidates are iteratively eliminated.
 */
export abstract class RoundBallotMethod<C extends string, I = undefined>
  extends BallotMethod<C>
  implements Ranker<C>
{
  private _rounds?: Round<C, I>[]

  public rounds(): Round<C, I>[] {
    if (this._rounds) return this._rounds
    let inRace = this.candidates
    const rounds: Round<C, I>[] = []
    while (inRace.length > 1) {
      const idx = rounds.length
      const { qualified, eliminated, scores, tieBreakSteps, info } = this.round(
        inRace,
        idx,
      )
      rounds.push({
        idx,
        candidates: inRace,
        finished: qualified.length <= 1,
        roundResult: {
          qualified,
          eliminated,
          scores,
          ...(tieBreakSteps && { tieBreakSteps }),
          ...(info !== undefined && { info }),
        },
      })
      inRace = qualified
    }
    this._rounds = rounds
    return rounds
  }

  public ranking(): C[][] {
    const rounds = this.rounds()
    const winners = rounds.at(-1)?.roundResult.qualified ?? this.candidates
    return [
      ...(winners.length > 0 ? [winners] : []),
      ...rounds.toReversed().map((r) => r.roundResult.eliminated),
    ].filter((tier) => tier.length > 0)
  }

  protected abstract round(candidates: C[], idx: number): QE<C, I>

  protected roundScoresZero(candidates: C[]): ScoreObject<C> {
    return scoresZero(candidates)
  }
}
