import { difference, mapValues } from 'lodash-es'
import { type QE } from '../../classes/round-ballot-method'
import { TbEliminateLast } from '../../classes/round-ballot-method-tb'
import type { Ballot, ScoreObject } from '../../types'
import { normalizeBallots, scoresToRanking } from '../../utils'
import { config } from '../../utils/config'
import { AbsoluteMajority } from '../absolute-majority'
import { FirstPastThePost } from '../first-past-the-post'

const reverseBallots = <C extends string>(ballots: Ballot<C>[]): Ballot<C>[] =>
  ballots.map((ballot) => ({ ...ballot, ranking: ballot.ranking.toReversed() }))

/**
 * #### Wikipedia: [Coombs' method](https://en.wikipedia.org/wiki/Coombs%27_method)
 */
export class Coombs<C extends string> extends TbEliminateLast<C> {
  protected oneRound(candidates: C[]): {
    ranking: C[][]
    scores: ScoreObject<C>
  } {
    const ballots = normalizeBallots(this.ballots, candidates)
    const reversedScores = new FirstPastThePost({
      ballots: reverseBallots(ballots),
      candidates,
    }).scores()
    const scores = mapValues(reversedScores, (s) => -s) as ScoreObject<C>
    return { ranking: scoresToRanking(scores, config.EPSILON), scores }
  }

  protected round(candidates: C[], idx: number): QE<C> {
    if (candidates.length < 2)
      return {
        eliminated: candidates,
        qualified: [],
        scores: this.roundScoresZero(candidates),
      }

    const ballots = normalizeBallots(this.ballots, candidates)
    const am = new AbsoluteMajority({ candidates, ballots })
    const amRanking = am.ranking()
    if (amRanking[0]?.length === 1) {
      const qualified = amRanking[0]
      return {
        eliminated: difference(candidates, qualified),
        qualified,
        scores: am.scores(),
      }
    }

    return super.round(candidates, idx)
  }
}
