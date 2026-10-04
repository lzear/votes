import { type QE, type Round } from '../types'
import { BallotMethod } from './ballot-method'
import { type Ranker } from './method'

/**
 * A round, and with `open`, the tie the tiebreakers leave when its order
 * decides the outcome: one of it goes out next, but nothing says which.
 */
export type Step<C extends string, I> = QE<C, I> & { open?: C[] }

// Races to try at most when finding who wins in some order of breaking ties.
const MAX_RACES = 10_000

/**
 * Voting system in which candidates are iteratively eliminated.
 */
export abstract class RoundBallotMethod<C extends string, I = undefined>
  extends BallotMethod<C>
  implements Ranker<C>
{
  private _rounds?: Round<C, I>[]

  private _twins?: Map<C, C>
  // Set while trying every order: branching then finds what checking
  // whether a tie may go out at once would.
  protected exploring = false

  /**
   * Who wins from `race`, one of `open` going out next, in some order of
   * breaking the ties left; or all of `race` past `MAX_RACES` races. Twins
   * win alike, so results hold one of each.
   */
  private possibleWinners(race: C[], open: C[]): C[] {
    const memo = new Map<string, ReadonlySet<C>>()
    let budget = MAX_RACES
    const branch = (r: C[], out: C[]): C[] =>
      this.oneEach(out).flatMap((c) => [...visit(r.filter((x) => x !== c))])
    const winnersOf = (r: C[]): C[] => {
      const sure = this.sureWinner(r)
      if (sure !== undefined) return [this.twin(sure)]
      const step = this.round(r, 0)
      if (step.open) return branch(r, step.open)
      return step.qualified.length > 0
        ? [...visit(step.qualified)]
        : step.eliminated.map((c) => this.twin(c))
    }
    const visit = (r: C[]): ReadonlySet<C> => {
      if (r.length <= 1 || budget <= 0)
        return new Set(r.map((c) => this.twin(c)))
      const key = this.raceKey(r)
      const known = memo.get(key)
      if (known) return known
      budget--
      const winners = new Set(winnersOf(r))
      memo.set(key, winners)
      return winners
    }
    this.exploring = true
    try {
      const winners = new Set(branch(race, open))
      return budget > 0 ? race.filter((c) => winners.has(this.twin(c))) : race
    } finally {
      this.exploring = false
    }
  }

  /**
   * The first of `c`'s twins: those every ballot ranks alike, whom every
   * count treats alike.
   */
  protected twin(c: C): C {
    if (!this._twins) {
      const first = new Map<string, C>()
      this._twins = new Map(
        this.candidates.map((x) => {
          const tiers = JSON.stringify(
            this.ballots.map((b) => b.ranking.findIndex((t) => t.includes(x))),
          )
          if (!first.has(tiers)) first.set(tiers, x)
          return [x, first.get(tiers) ?? x]
        }),
      )
    }
    return this._twins.get(c) ?? c
  }

  // `race` as how many of each twin it holds.
  protected raceKey(race: C[]): string {
    const counts = new Map<C, number>()
    for (const c of race)
      counts.set(this.twin(c), (counts.get(this.twin(c)) ?? 0) + 1)
    return JSON.stringify(
      this.candidates.flatMap((c) => {
        const n = counts.get(c)
        return n === undefined ? [] : [[c, n]]
      }),
    )
  }

  // One of each twin in `group`.
  protected oneEach(group: C[]): C[] {
    return new Map(group.map((c) => [this.twin(c), c])).values().toArray()
  }

  public rounds(): Round<C, I>[] {
    if (this._rounds) return this._rounds
    let inRace = this.candidates
    const rounds: Round<C, I>[] = []
    while (inRace.length > 1) {
      const index = rounds.length
      const { open, ...step } = this.round(inRace, index)
      if (open) {
        // The count stops on those who win in some order of breaking it.
        const race = inRace
        const winners = this.possibleWinners(race, open)
        rounds.push({
          index,
          candidates: race,
          ...step,
          qualified: winners,
          eliminated: race.filter((c) => !winners.includes(c)),
        })
        break
      }
      rounds.push({ index, candidates: inRace, ...step })
      inRace = step.qualified
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
  protected abstract round(candidates: C[], index: number): Step<C, I>

  /**
   * The candidate who wins from `race` whatever order ties break in, if
   * known.
   */
  protected abstract sureWinner(race: C[]): C | undefined
}
