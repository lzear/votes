import { type Ranker } from './classes/method'
import {
  type MethodTiebreaker,
  type Run,
  type TbEntry,
  tiebreaker,
} from './classes/tiebreaker'
import { type Profile } from './types'
import { iterateRanking } from './utils'

export interface StepResult<C extends string> {
  // The method's label, or its class name.
  name: string
  before: C[][]
  after: C[][]
  // The method's run on each tier it ranked.
  runs: (Run<C> & { candidates: C[] })[]
}

export interface ElectionResult<C extends string> {
  ranking: C[][]
  steps: StepResult<C>[]
}

export type ElectionInput<C extends string> = Profile<C> & {
  methods: readonly [NoInfer<TbEntry<C>>, ...NoInfer<TbEntry<C>>[]]
}

/**
 * Chains methods: the first ranks the candidates, each next one re-ranks the
 * tiers still tied, like round methods' `tieBreakers`.
 *
 * @example
 * ```ts
 * new Election({
 *   candidates,
 *   ballots,
 *   methods: [InstantRunoff, Schulze, tb(RandomCandidates, { rng })],
 * })
 * ```
 */
export class Election<C extends string> implements Ranker<C> {
  private readonly input: ElectionInput<C>
  private candidates: C[]
  private tiebreakers: MethodTiebreaker<C>[]
  private _result?: ElectionResult<C>

  constructor(input: ElectionInput<C>) {
    const { methods, ...profile } = input
    this.input = input
    this.candidates = [...new Set(profile.candidates)]
    this.tiebreakers = methods.map((m) => tiebreaker(m, profile))
  }

  result(): ElectionResult<C> {
    if (this._result) return this._result

    const steps: StepResult<C>[] = []
    let current = this.candidates.length > 0 ? [this.candidates] : []
    for (const { name, run } of this.tiebreakers) {
      if (current.every((tier) => tier.length <= 1)) break
      const runs: StepResult<C>['runs'] = []
      const after = current.flatMap((tier) => {
        if (tier.length <= 1) return [tier]
        const r = { candidates: tier, ...run(tier) }
        runs.push(r)
        return r.ranking
      })
      steps.push({ name, before: current, after, runs })
      current = after
    }

    this._result = { ranking: current, steps }
    return this._result
  }

  ranking(): C[][] {
    return this.result().ranking
  }

  // The same election, every method restricted to `candidates`.
  restrict(candidates: C[]): Election<C> {
    const election = new Election(this.input)
    election.candidates = [...new Set(candidates)]
    election.tiebreakers = this.tiebreakers.map((t) => t.restrict(candidates))
    return election
  }

  /**
   * Ranking built by repeated wins: run the full election, record the
   * winning tier, then re-run the whole election restricted to the remaining
   * candidates for the next place, and so on. See `Method#iteratedRanking`.
   */
  iteratedRanking(): C[][] {
    return iterateRanking(this)
  }
}
