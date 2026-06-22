import type { Ranker } from './classes/method'
import type { Round } from './classes/round-ballot-method'
import type { ScoreObject } from './types'
import { applyRankingAsTiebreaker, scoresToRanking } from './utils'
import { iterateRanking } from './utils/iterate-ranking'

export interface StepResult<C extends string> {
  /** Constructor name of the ranker that produced this step. */
  rankerName: string
  before: C[][]
  after: C[][]
  rounds?: Round<C>[]
  scores?: ScoreObject<C>
}

export interface ElectionResult<C extends string> {
  ranking: C[][]
  steps: StepResult<C>[]
}

const instanceName = (instance: object): string =>
  (Object.getPrototypeOf(instance) as { constructor?: { name?: string } })
    .constructor?.name ?? 'Unknown'

const isRandomInstance = (instance: object): boolean =>
  (Object.getPrototypeOf(instance) as { constructor?: { isRandom?: unknown } })
    .constructor?.isRandom === true

const computeFor = <C extends string>(
  instance: Ranker<C> & {
    computeRounds?(): Round<C>[]
    scores?(): ScoreObject<C>
  },
): { ranking: C[][]; rounds?: Round<C>[]; scores?: ScoreObject<C> } => {
  if (typeof instance.computeRounds === 'function') {
    const rounds = instance.computeRounds()
    return { ranking: instance.ranking(), rounds }
  }

  if (!isRandomInstance(instance) && typeof instance.scores === 'function') {
    const scores = instance.scores()
    return { ranking: scoresToRanking(scores), scores }
  }

  return { ranking: instance.ranking() }
}

/**
 * Chains pre-built rankers: the first provides the primary ranking, each
 * subsequent one breaks remaining ties.
 *
 * @example
 * ```ts
 * new Election({
 *   rankers: [
 *     new InstantRunoff({ ballots, candidates, tieBreakers: [tb(Copeland)] }),
 *     new Schulze(matrixFromBallots(ballots, candidates)),
 *     new RandomCandidates({ candidates, rng: myRng }),
 *   ],
 * })
 * ```
 */
export class Election<C extends string> implements Ranker<C> {
  private readonly rankers: [Ranker<C>, ...Ranker<C>[]]

  private _result?: ElectionResult<C>

  constructor({ rankers }: { rankers: [Ranker<C>, ...Ranker<C>[]] }) {
    this.rankers = rankers
  }

  result(): ElectionResult<C> {
    if (this._result) return this._result

    const steps: StepResult<C>[] = []

    // First ranker produces the primary ranking
    const {
      ranking: firstRanking,
      rounds,
      scores,
    } = computeFor(this.rankers[0])
    const allCandidates = firstRanking.flat()

    steps.push({
      rankerName: instanceName(this.rankers[0]),
      before: [allCandidates],
      after: firstRanking,
      ...(rounds ? { rounds } : {}),
      ...(scores ? { scores } : {}),
    })

    let current = firstRanking

    // Subsequent rankers refine remaining ties
    for (const ranker of this.rankers.slice(1)) {
      if (current.every((r) => r.length <= 1)) break

      const { ranking, rounds: r2, scores: s2 } = computeFor(ranker)
      const step: StepResult<C> = {
        rankerName: instanceName(ranker),
        before: current,
        after: applyRankingAsTiebreaker(ranking, current),
        ...(r2 ? { rounds: r2 } : {}),
        ...(s2 ? { scores: s2 } : {}),
      }

      steps.push(step)
      current = step.after
    }

    this._result = { ranking: current, steps }
    return this._result
  }

  ranking(): C[][] {
    return this.result().ranking
  }

  /**
   * A new Election with every ranker restricted to a subset of candidates.
   * Requires every ranker to support `restrict()` (all built-in methods do).
   */
  restrict(candidates: C[]): Election<C> {
    const restricted = this.rankers.map((ranker) => {
      const r = ranker as Ranker<C> & {
        restrict?: (candidates: C[]) => Ranker<C>
      }
      if (typeof r.restrict !== 'function')
        throw new TypeError(
          `Ranker "${instanceName(ranker)}" does not support restrict()`,
        )
      return r.restrict(candidates)
    })
    return new Election({ rankers: restricted as [Ranker<C>, ...Ranker<C>[]] })
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
