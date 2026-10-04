import {
  type Profile,
  type QE,
  type ScoreObject,
  type TieBreakStep,
} from '../types'
import { RoundBallotMethod } from './round-ballot-method'
import {
  type MethodTiebreaker,
  type TbEntry,
  type Tiebreaker,
  tiebreaker,
} from './tiebreaker'

export abstract class RoundBallotMethodTb<
  C extends string,
  I = undefined,
> extends RoundBallotMethod<C, I> {
  // The caller's, applied after the built-in ones.
  private tieBreakers: MethodTiebreaker<C>[]

  constructor(input: Profile<C> & { tieBreakers?: TbEntry<C>[] }) {
    super(input)
    // The input's own ballots: normalized ones lose majority judgment's
    // empty grades.
    const { candidates, ballots } = input
    const profile = {
      candidates,
      ballots,
      unrankedLast: this.unrankedLast,
      countBlank: this.countBlank,
    }
    this.tieBreakers = (input.tieBreakers ?? []).map((e) =>
      tiebreaker(e, profile),
    )
  }

  // Restricts the caller's tiebreakers too: rebuilt on the normalized ballots
  // restrict() passes, majority judgment would lose its empty grades.
  public override restrict<D extends C>(
    candidates: D[],
  ): RoundBallotMethodTb<D, I> {
    const method = super.restrict(candidates) as RoundBallotMethodTb<D, I>
    // Restricted to `candidates`, they rank only those.
    method.tieBreakers = this.tieBreakers.map((t) =>
      t.restrict(candidates),
    ) as unknown as MethodTiebreaker<D>[]
    return method
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

    const tiebreakers = [...this.builtInTieBreakers(), ...this.tieBreakers]
    for (const [index, { name, run }] of tiebreakers.entries()) {
      if (current.length <= 1) break
      const { ranking, scores } = run(current)
      const last = ranking.at(-1) ?? []
      const upper = ranking.slice(0, -1).flat()
      tieBreakSteps.push({
        index,
        name,
        candidates: current,
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
    index: number,
  ): { ranking: C[][]; scores: ScoreObject<C> }

  protected round(candidates: C[], index: number): QE<C, I> {
    if (candidates.length < 2)
      return {
        qualified: [],
        eliminated: candidates,
        scores: this.roundScoresZero(candidates),
      }

    const { ranking, scores } = this.oneRound(candidates, index)
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
