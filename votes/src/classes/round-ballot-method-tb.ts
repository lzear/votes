import {
  type Profile,
  type QE,
  type ScoreObject,
  type TieBreakStep,
} from '../types'
import { RoundBallotMethod } from './round-ballot-method'
import { type TbEntry, type Tiebreaker, tiebreaker } from './tiebreaker'

export abstract class RoundBallotMethodTb<
  C extends string,
  I = undefined,
> extends RoundBallotMethod<C, I> {
  private readonly tiebreakers: Tiebreaker<C>[]

  constructor(input: Profile<C> & { tieBreakers?: TbEntry<C>[] }) {
    super(input)
    // The input's own ballots: normalized ones lose majority judgment's
    // empty grades.
    const { candidates, ballots } = input
    const profile = { candidates, ballots, unrankedLast: this.unrankedLast }
    this.tiebreakers = [
      ...this.builtInTieBreakers(),
      ...(input.tieBreakers ?? []).map((e) => tiebreaker(e, profile)),
    ]
  }

  /**
   * Tiebreakers the method applies before the caller's.
   */
  protected builtInTieBreakers(): Tiebreaker<C>[] {
    return []
  }

  /**
   * Apply tiebreakers sequentially to a set of tied candidates.
   * Returns qualified survivors, eliminated losers, and a trace of each step.
   * If unresolvable, all pending are returned as eliminated.
   */
  protected resolvePending(pending: C[]): {
    qualified: C[]
    eliminated: C[]
    tieBreakSteps: TieBreakStep<C>[]
  } {
    let current = pending
    const promoted: C[] = []
    const tieBreakSteps: TieBreakStep<C>[] = []

    for (const [tbIndex, { name: tbName, run }] of this.tiebreakers.entries()) {
      if (current.length <= 1) break
      const { ranking, scores } = run(current)
      const last = ranking.at(-1) ?? []
      const upper = ranking.slice(0, -1).flat()
      tieBreakSteps.push({
        tbIndex,
        tbName,
        input: current,
        ranking,
        ...(scores !== undefined && { scores }),
        resolved: upper,
        remaining: last,
      })
      if (last.length >= current.length) continue

      promoted.push(...upper)
      current = last
    }

    return { qualified: promoted, eliminated: current, tieBreakSteps }
  }
}

/**
 * Each round: rank candidates, eliminate the last-tier candidate(s).
 * Tiebreakers are applied when multiple candidates share the last tier.
 */
export abstract class TbEliminateLast<
  C extends string,
  I = undefined,
> extends RoundBallotMethodTb<C, I> {
  protected abstract oneRound(
    candidates: C[],
    idx: number,
  ): { ranking: C[][]; scores: ScoreObject<C> }

  protected round(candidates: C[], idx: number): QE<C, I> {
    if (candidates.length < 2)
      return {
        qualified: [],
        eliminated: candidates,
        scores: this.roundScoresZero(candidates),
      }

    const { ranking, scores } = this.oneRound(candidates, idx)
    const qualified = ranking.slice(0, -1).flat()
    const lastTier = ranking.at(-1) ?? []

    if (lastTier.length <= 1) return { qualified, eliminated: lastTier, scores }

    const {
      qualified: q2,
      eliminated,
      tieBreakSteps,
    } = this.resolvePending(lastTier)
    return {
      qualified: [...qualified, ...q2],
      eliminated,
      scores,
      ...(tieBreakSteps.length > 0 && { tieBreakSteps }),
    }
  }
}
