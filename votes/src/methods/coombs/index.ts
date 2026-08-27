import { difference, mapValues } from 'lodash-es'
import { type QE } from '../../classes/round-ballot-method'
import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import { type Ballot, type ScoreObject } from '../../types'
import { scoresToRanking } from '../../utils'
import { config } from '../../utils/config'
import { AbsoluteMajority } from '../absolute-majority'
import { FirstPastThePost } from '../first-past-the-post'

const reverseBallots = <C extends string>(ballots: Ballot<C>[]): Ballot<C>[] =>
  ballots.map((ballot) => ({ ...ballot, ranking: ballot.ranking.toReversed() }))

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
    const ballots = this.ballotsFor(candidates)
    const reversedScores = new FirstPastThePost({
      ballots: reverseBallots(ballots),
      candidates,
    }).scores()
    const scores = mapValues(reversedScores, (s) => -s) as ScoreObject<C>
    return { ranking: scoresToRanking(scores, config.EPSILON), scores }
  }

  protected round(candidates: C[], idx: number): QE<C, CoombsInfo> {
    if (candidates.length < 2)
      return {
        eliminated: candidates,
        qualified: [],
        scores: this.roundScoresZero(candidates),
        info: { resolution: 'elimination' },
      }

    const ballots = this.ballotsFor(candidates)
    const am = new AbsoluteMajority({ candidates, ballots })
    const amRanking = am.ranking()
    if (amRanking[0]?.length === 1) {
      const qualified = amRanking[0]
      return {
        eliminated: difference(candidates, qualified),
        qualified,
        scores: am.scores(),
        info: { resolution: 'majority' },
      }
    }

    return {
      ...super.round(candidates, idx),
      info: { resolution: 'elimination' },
    }
  }
}
