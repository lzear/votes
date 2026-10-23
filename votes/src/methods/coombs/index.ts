import type { Step } from '../../classes/round-ballot-method'
import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { config } from '../../utils/config'
import { majorityWinner } from '../absolute-majority'
import { antiPluralityScores } from '../anti-plurality'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

/**
Round-level detail specific to Coombs: how this round was resolved.
Normally a round eliminates whoever has the most last-place votes, but it
resolves by outright majority instead as soon as a candidate has an
absolute majority of first choices — which can happen on the very last
round, so this can't be inferred from round position alone.
*/
export type CoombsInfo = {
  readonly resolution: 'majority' | 'elimination'
}

/**
#### Wikipedia: [Coombs' method](https://en.wikipedia.org/wiki/Coombs%27_method)
*/
export class Coombs<C extends string> extends TbEliminateLast<C, CoombsInfo> {
  public static readonly label = 'Coombs'

  protected oneRound(candidates: readonly C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const scores = antiPluralityScores(
      this.ballots,
      candidates,
      this.unrankedLast,
    )
    return { ranking: scoresToRanking(scores, config.EPSILON), scores }
  }

  // A majority ends the count, everyone else out at once.
  protected override nextOut(race: readonly C[]): readonly C[] {
    const winner = majorityWinner(
      firstChoices(this.ballots, race),
      this.castBallots(race),
    )
    return winner === undefined
      ? super.nextOut(race)
      : race.filter((c) => c !== winner)
  }

  protected override round(
    candidates: C[],
    index: number,
  ): Step<C, CoombsInfo> {
    const scores = firstChoices(this.ballots, candidates)
    const winner = majorityWinner(scores, this.castBallots(candidates))
    if (winner !== undefined)
      return {
        eliminated: candidates.filter((c) => c !== winner),
        qualified: [winner],
        scores,
        info: { resolution: 'majority' },
      }

    return {
      ...super.round(candidates, index),
      info: { resolution: 'elimination' },
    }
  }
}
