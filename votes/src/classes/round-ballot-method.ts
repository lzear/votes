import type { ScoreObject } from '../types'
import { scoresZero } from '../utils'
import { BallotMethod } from './ballot-method'
import type { Ranker } from './method'

/** Trace of one tiebreaker's work within a round. */
export interface TieBreakStep<C extends string> {
  /** Position in the tieBreakers array (0-based). */
  tbIndex: number
  /** Constructor name of the tiebreaker method. */
  tbName: string
  /** Candidates that were tied going into this step. */
  input: C[]
  /** Full ranking produced by the tiebreaker on `input`. */
  ranking: C[][]
  /** Scores produced by the tiebreaker (when the method supports scores()). */
  scores?: Partial<Record<C, number>>
  /** Candidates promoted out of the tie (upper tiers of `ranking`). */
  resolved: C[]
  /** Candidates still tied after this step (last tier of `ranking`). */
  remaining: C[]
}

export interface QE<C extends string> {
  qualified: C[]
  eliminated: C[]
  scores: ScoreObject<C>
  tieBreakSteps?: TieBreakStep<C>[]
}

export interface Round<C extends string> {
  finished: boolean
  idx: number
  candidates: C[]
  roundResult: {
    eliminated: C[]
    qualified: C[]
    scores: ScoreObject<C>
    tieBreakSteps?: TieBreakStep<C>[]
  }
}

/**
 * Voting system in which candidates are iteratively eliminated.
 */
export abstract class RoundBallotMethod<C extends string>
  extends BallotMethod<C>
  implements Ranker<C>
{
  private _rounds?: Round<C>[]

  public computeRounds(): Round<C>[] {
    if (this._rounds) return this._rounds
    let inRace = this.candidates
    const rounds: Round<C>[] = []
    while (inRace.length > 0) {
      const idx = rounds.length
      const { qualified, eliminated, scores, tieBreakSteps } = this.round(
        inRace,
        idx,
      )
      rounds.push({
        idx,
        candidates: inRace,
        finished: inRace.length <= 1,
        roundResult: {
          qualified,
          eliminated,
          scores,
          ...(tieBreakSteps ? { tieBreakSteps } : {}),
        },
      })
      inRace = qualified
    }
    this._rounds = rounds
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
