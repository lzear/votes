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
  
  @internal
  */
  protected abstract kept(race: readonly C[]): readonly C[]

  // The matrix of duels within `race`.
  /**
  @internal
  */
  protected duels(race: readonly C[]): Matrix<C> {
    return subMatrix(this.matrix, race)
  }

  /**
  @internal
  */
  protected oneRound(candidates: readonly C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = firstChoices(this.ballots, candidates)
    return { ranking: scoresToRanking(scores), scores }
  }

  /**
  @internal
  */
  protected override sureWinner(race: readonly C[]): C | undefined {
    const kept = this.kept(race)
    return kept.length === 1 ? kept[0] : undefined
  }

  /**
  @internal
  */
  protected override nextOut(race: readonly C[]): readonly C[] {
    const kept = this.kept(race)
    return kept.length < race.length
      ? race.filter((c) => !kept.includes(c))
      : super.nextOut(race)
  }

  /**
  @internal
  */
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
