import type { ScoreObject } from '../types'
import { BallotMethod } from './ballot-method'
import type { Ranker } from './method'

export interface Round<C extends string> {
  finished?: boolean
  idx: number
  candidates: C[]
  roundResult: {
    eliminated: C[]
    qualified: C[]
    scores: ScoreObject<C>
  }
}

/**
 * Voting system in which candidates are iteratively eliminated.
 */

export abstract class RoundBallotMethod<C extends string>
  extends BallotMethod<C>
  implements Ranker<C>
{
  protected rounds: Round<C>[] = []

  public computeRounds(): Round<C>[] {
    while (this.lastRoundQualified().length > 0) this.computeNextRound()

    return this.rounds
  }

  public ranking(): C[][] {
    return [...this.computeRounds()]
      .toReversed()
      .map((r) => r.roundResult.eliminated)
      .filter((eliminated) => eliminated.length)
  }

  protected abstract round(
    candidates: C[],
    idx?: number,
  ): {
    qualified: C[]
    eliminated: C[]
    scores: ScoreObject<C>
  }

  private computeNextRound(): void {
    const previousRound = this.rounds.at(-1)
    const candidates = previousRound?.roundResult.qualified ?? this.candidates

    const idx = previousRound ? previousRound.idx + 1 : 0

    const round = {
      candidates,
      idx,
      roundResult: this.round(candidates, idx),
    }

    this.rounds = [
      ...this.rounds,
      {
        finished: round.roundResult.qualified.length === 0,
        ...round,
      },
    ]
  }

  private lastRoundQualified(): string[] {
    const previousRound = this.rounds.at(-1)
    return previousRound?.roundResult.qualified ?? this.candidates
  }
}
