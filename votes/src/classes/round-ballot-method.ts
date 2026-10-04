import { type QE, type Round } from '../types'
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
      const index = rounds.length
      const round = { index, candidates: inRace, ...this.round(inRace, index) }
      rounds.push(round)
      inRace = round.qualified
    }
    this._rounds = rounds
    return rounds
  }

  public ranking(): C[][] {
    const rounds = this.rounds()
    const winners = rounds.at(-1)?.qualified ?? this.candidates
    return [
      ...(winners.length > 0 ? [winners] : []),
      ...rounds.toReversed().map((r) => r.eliminated),
    ].filter((tier) => tier.length > 0)
  }

  // Only ever called with two candidates or more.
  protected abstract round(candidates: C[], index: number): QE<C, I>
}
