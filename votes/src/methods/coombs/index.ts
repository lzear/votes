import { type QE } from '../../classes/round-ballot-method'
import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import { type Ballot, type ScoreObject } from '../../types'
import { scoresToRanking, totalBallotsWeight } from '../../utils'
import { config } from '../../utils/config'
import { majorityWinner } from '../absolute-majority'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

const reverseBallots = <C extends string>(ballots: Ballot<C>[]): Ballot<C>[] =>
  ballots.map((ballot) => ({ ...ballot, ranking: ballot.ranking.toReversed() }))

const ranksAll = <C extends string>(
  { ranking }: Ballot<C>,
  candidates: Set<C>,
): boolean => {
  let ranked = 0
  for (const rank of ranking)
    for (const c of rank) if (candidates.has(c)) ranked++
  return ranked === candidates.size
}

/**
 * Round-level detail specific to Coombs: how this round was resolved.
 * Normally a round eliminates whoever has the most last-place votes, but it
 * resolves by outright majority instead as soon as a candidate has an
 * absolute majority of first choices — which can happen on the very last
 * round, so this can't be inferred from round position alone.
 */
export interface CoombsInfo {
  resolution: 'majority' | 'elimination'
}

/**
 * #### Wikipedia: [Coombs' method](https://en.wikipedia.org/wiki/Coombs%27_method)
 */
export class Coombs<C extends string> extends TbEliminateLast<C, CoombsInfo> {
  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    // Only a ballot that ranks everyone left has a last choice; with
    // unrankedLast, any ballot that ranks someone does.
    const running = new Set(candidates)
    const complete = this.unrankedLast
      ? this.ballots
      : this.ballots.filter((b) => ranksAll(b, running))
    const reversedScores = firstChoices(reverseBallots(complete), candidates)
    const scores = Object.fromEntries(
      Object.entries<number>(reversedScores).map(([c, s]) => [c, -s]),
    ) as ScoreObject<C>
    return { ranking: scoresToRanking(scores, config.EPSILON), scores }
  }

  protected override round(candidates: C[], idx: number): QE<C, CoombsInfo> {
    if (candidates.length < 2)
      return {
        eliminated: candidates,
        qualified: [],
        scores: this.roundScoresZero(candidates),
        info: { resolution: 'elimination' },
      }

    const scores = firstChoices(this.ballots, candidates)
    const winner = majorityWinner(scores, totalBallotsWeight(this.ballots))
    if (winner !== undefined)
      return {
        eliminated: candidates.filter((c) => c !== winner),
        qualified: [winner],
        scores,
        info: { resolution: 'majority' },
      }

    return {
      ...super.round(candidates, idx),
      info: { resolution: 'elimination' },
    }
  }
}
