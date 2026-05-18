import type { Ranker } from './classes/method'
import type { Round } from './classes/round-ballot-method'
import type { ScoreObject } from './types'
import { applyRankingAsTiebreaker, scoresToRanking } from './utils'

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
  instance: Ranker<C>,
): { ranking: C[][]; rounds?: Round<C>[]; scores?: ScoreObject<C> } => {
  interface WithRounds {
    computeRounds(): Round<C>[]
  }
  interface WithScores {
    scores(): ScoreObject<C>
  }

  if (
    'computeRounds' in instance &&
    typeof instance.computeRounds === 'function'
  ) {
    const rounds = (instance as unknown as WithRounds).computeRounds()
    const ranking = rounds
      .toReversed()
      .map((r) => r.roundResult.eliminated)
      .filter((e) => e.length > 0)
    return { ranking, rounds }
  }

  if (
    !isRandomInstance(instance) &&
    'scores' in instance &&
    typeof instance.scores === 'function'
  ) {
    const scores = (instance as unknown as WithScores).scores()
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
}
