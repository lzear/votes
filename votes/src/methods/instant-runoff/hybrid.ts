import type { Step } from '../../classes/round-ballot-method'
import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { Matrix, ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { subMatrix } from '../../utils/make-matrix'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

/**
Instant runoff, except that a round in which `kept` narrows the race puts
everyone else out at once.
*/
export abstract class InstantRunoffHybrid<
  C extends string,
> extends TbEliminateLast<C> {
  /**
  Those of `race` the method keeps before counting first choices: all of
  them for a plain instant-runoff round.
  */
  protected abstract kept(race: readonly C[]): readonly C[]

  // The matrix of duels within `race`.
  protected duels(race: readonly C[]): Matrix<C> {
    return subMatrix(this.matrix, race)
  }

  protected oneRound(candidates: readonly C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = firstChoices(this.ballots, candidates)
    return { ranking: scoresToRanking(scores), scores }
  }

  protected override sureWinner(race: readonly C[]): C | undefined {
    const kept = this.kept(race)
    return kept.length === 1 ? kept[0] : undefined
  }

  protected override nextOut(race: readonly C[]): readonly C[] {
    const kept = this.kept(race)
    return kept.length < race.length
      ? race.filter((c) => !kept.includes(c))
      : super.nextOut(race)
  }

  protected override round(
    candidates: readonly C[],
    index: number,
  ): Step<C, undefined> {
    const kept = this.kept(candidates)
    if (kept.length === candidates.length) return super.round(candidates, index)
    return {
      qualified: kept,
      eliminated: candidates.filter((c) => !kept.includes(c)),
      scores: firstChoices(this.ballots, candidates),
    }
  }
}
