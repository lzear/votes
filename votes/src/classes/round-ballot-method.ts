import { type ScoreObject } from '../types'
import { scoresZero } from '../utils'
import { BallotMethod } from './ballot-method'
import { type Ranker } from './method'

// Trace of one tiebreaker's work within a round.
export interface TieBreakStep<C extends string> {
  // Position in the tieBreakers array (0-based).
  tbIndex: number
  // Constructor name of the tiebreaker method.
  tbName: string
  // Candidates that were tied going into this step.
  input: C[]
  // Full ranking produced by the tiebreaker on `input`.
  ranking: C[][]
  // Scores produced by the tiebreaker (when the method supports scores()).
  scores?: Partial<Record<C, number>>
  // Candidates promoted out of the tie (upper tiers of `ranking`).
  resolved: C[]
  // Candidates still tied after this step (last tier of `ranking`).
  remaining: C[]
}

export interface QE<C extends string, I = undefined> {
  qualified: C[]
  eliminated: C[]
  scores: ScoreObject<C>
  tieBreakSteps?: TieBreakStep<C>[]
  // Method-specific detail about this round
  info?: I
}

export interface Round<C extends string, I = undefined> {
  finished: boolean
  idx: number
  candidates: C[]
  roundResult: {
    eliminated: C[]
    qualified: C[]
    scores: ScoreObject<C>
    tieBreakSteps?: TieBreakStep<C>[]
    info?: I
  }
}

/**
 * Voting system in which candidates are iteratively eliminated.
 */
export abstract class RoundBallotMethod<C extends string, I = undefined>
  extends BallotMethod<C>
  implements Ranker<C>
{
  private _rounds?: Round<C, I>[]

  public computeRounds(): Round<C, I>[] {
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
    const rounds = this.computeRounds()
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
