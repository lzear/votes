import { majorityWinner } from '../methods/absolute-majority'
import { firstChoices } from '../methods/first-past-the-post/iterate-first-choices'
import type { Profile, ScoreObject, TieBreakStep } from '../types'
import { MAX_READS, RoundBallotMethod, type Step } from './round-ballot-method'
import type { MethodTiebreaker, Tiebreaker } from './tiebreaker'

export abstract class RoundBallotMethodTb<
  C extends string,
  I = undefined,
> extends RoundBallotMethod<C, I> {
  // The Election's methods after this one, applied after the built-in ones.
  private tieBreakers: readonly MethodTiebreaker<C>[]

  constructor(
    input: Profile<C> & {
      /**
      Set by `Election`: the methods after this one.
      
      @internal
      */
      tieBreakers?: readonly MethodTiebreaker<C>[]
    },
  ) {
    super(input)
    this.tieBreakers = input.tieBreakers ?? []
  }

  // Restricts the Election's tiebreakers too, each as its own restrict()
  // does: majority judgment keeps its grades.
  public override restrict(candidates: readonly C[]): this {
    const method = super.restrict(candidates)
    method.tieBreakers = this.tieBreakers.map((t) => t.restrict(candidates))
    return method
  }

  /**
  Tiebreakers the method applies before the caller's.
  */
  protected builtInTieBreakers(): Tiebreaker<C>[] {
    return []
  }

  /**
  Apply tiebreakers sequentially to a set of tied candidates.
  Returns qualified survivors, eliminated losers, and a trace of each step.
  If unresolvable, all pending are returned as eliminated.
  */
  protected resolvePending(pending: readonly C[]): {
    qualified: C[]
    eliminated: readonly C[]
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

  // One with a majority of the ballots cast: no round puts them out.
  protected sureWinner(race: readonly C[]): C | undefined {
    return majorityWinner(
      firstChoices(this.ballots, race),
      this.castBallots(race),
    )
  }
}

// States to try at most when checking every order of eliminating a tie: past
// it, or past `MAX_READS` ballots read, the count stops on the tie, which costs
// only the ranking below winners.
const MAX_ORDERS = 256

/**
Rounds that put out one candidate at a time: a tie the tiebreakers leave goes
out at once if no order of it changes the outcome.
*/
export abstract class TbEliminateOne<
  C extends string,
  I = undefined,
> extends RoundBallotMethodTb<C, I> {
  /**
  Those one of whom the method puts out of `race` next, after its
  tiebreakers: what `openTie` checks orders of elimination with.
  */
  protected abstract nextOut(race: readonly C[]): readonly C[]

  /**
  Whether putting `group` out of `race` at once ends where every order of
  putting it out one at a time does.
  */
  protected canEliminateTogether(
    group: readonly C[],
    race: readonly C[],
  ): boolean {
    if (this.exploring) return false
    const others = race.filter((c) => !group.includes(c))
    const seen = new Set<string>()
    const most = Math.min(MAX_ORDERS, MAX_READS / this.ballots.length)
    // Whether those put out of what is left are all in `left`, until gone.
    const safe = (left: readonly C[]): boolean => {
      const key = this.raceKey(left)
      if (left.length === 0 || seen.has(key)) return true
      seen.add(key)
      if (seen.size > most) return false
      const out = this.nextOut([...others, ...left])
      return (
        out.every((c) => left.includes(c)) &&
        this.oneEach(out).every((c) => safe(left.filter((x) => x !== c)))
      )
    }
    return this.oneEach(group).every((g) => safe(group.filter((x) => x !== g)))
  }

  /**
  `group`, a tie the tiebreakers leave, as open when its order matters.
  */
  protected openTie(
    group: readonly C[],
    race: readonly C[],
  ): { open?: readonly C[] } {
    return group.length > 1 &&
      (group.length === race.length ||
        !this.merged(() => this.canEliminateTogether(group, race)))
      ? { open: group }
      : {}
  }
}

/**
Each round: rank candidates, eliminate the last-tier candidate(s).
Tiebreakers are applied when multiple candidates share the last tier; a tie
they leave goes out at once if no order of it changes the outcome, else
the count stops on those who win in some order.
*/
export abstract class TbEliminateLast<
  C extends string,
  I = undefined,
> extends TbEliminateOne<C, I> {
  protected abstract oneRound(
    candidates: readonly C[],
    index: number,
  ): { ranking: C[][]; scores: ScoreObject<C> }

  protected override nextOut(race: readonly C[]): readonly C[] {
    const last = this.oneRound(race, 0).ranking.at(-1) ?? []
    return last.length > 1 ? this.resolvePending(last).eliminated : last
  }

  protected round(candidates: readonly C[], index: number): Step<C, I> {
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
      ...this.openTie(eliminated, candidates),
    }
  }
}
