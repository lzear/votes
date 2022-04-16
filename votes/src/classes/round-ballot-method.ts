import { ScoreObject } from '../types'
import { BallotMethod } from './ballot-method'
import { Ranker } from './method'

export type Round = {
  finished?: boolean
  idx: number
  candidates: string[]
  roundResult: {
    eliminated: string[]
    qualified: string[]
    scores: ScoreObject
  }
}

export abstract class RoundBallotMethod extends BallotMethod implements Ranker {
  protected rounds: Round[] = []

  public computeRounds(): Round[] {
    while (this.lastRoundQualified().length > 0) {
      this.computeNextRound()
    }
    return this.rounds
  }

  public ranking(): string[][] {
    return [...this.computeRounds()]
      .reverse()
      .map((r) => r.roundResult.eliminated)
      .filter((eliminated) => eliminated.length)
  }

  protected abstract round(
    candidates: string[],
    idx?: number,
  ): {
    qualified: string[]
    eliminated: string[]
    scores: ScoreObject
  }

  private computeNextRound(): void {
    const previousRound = this.rounds.at(-1)
    const candidates = previousRound?.roundResult.qualified || this.candidates

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
    return previousRound?.roundResult.qualified || this.candidates
  }
}
