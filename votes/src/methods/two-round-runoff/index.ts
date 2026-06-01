import { type QE } from '../../classes/round-ballot-method'
import { RoundBallotMethodTb } from '../../classes/round-ballot-method-tb'
import { AbsoluteMajority } from '../absolute-majority'
import { FirstPastThePost } from '../first-past-the-post'

/**
 * #### Wikipedia: [Two-round system](https://en.wikipedia.org/wiki/Two-round_system)
 */
export class TwoRoundRunoff<C extends string> extends RoundBallotMethodTb<C> {
  private runoffRound(candidates: C[]): QE<C> {
    const fptp = new FirstPastThePost({ ballots: this.ballots, candidates })
    const ranking = fptp.ranking()
    const winner = ranking[0] ?? []
    const losers = ranking.slice(1).flat()
    const scores = fptp.scores()
    if (winner.length === 1)
      return { qualified: winner, eliminated: losers, scores }
    const {
      qualified: q,
      eliminated: e,
      tieBreakSteps,
    } = this.resolvePending(winner)
    return {
      qualified: q,
      eliminated: [...e, ...losers],
      scores,
      ...(tieBreakSteps.length > 0 ? { tieBreakSteps } : {}),
    }
  }

  protected round(candidates: C[], idx: number): QE<C> {
    const { ballots } = this

    // idx > 1 shouldn't happen normally; safety fallback
    if (idx > 1)
      return {
        qualified: [],
        eliminated: candidates,
        scores: this.roundScoresZero(candidates),
      }

    if (idx === 1) return this.runoffRound(candidates)

    // idx === 0: qualification round — find top 2
    const amRanking = new AbsoluteMajority({ ballots, candidates }).ranking()
    const [r1, r2] = amRanking
    if (r2 && r1?.length === 1) {
      // Absolute majority — winner already decided
      const am = new AbsoluteMajority({ ballots, candidates })
      return {
        qualified: r1,
        eliminated: r2,
        scores: am.scores(),
      }
    }

    const fptp = new FirstPastThePost({ ballots, candidates })
    const ranking = fptp.ranking()
    const scores = fptp.scores()
    const [firsts = [], seconds = [], ...restTiers] = ranking
    const rest = restTiers.flat()

    if (firsts.length >= 2) {
      // Top tier has 2+ — qualify first 2, eliminate rest
      if (firsts.length === 2)
        return { qualified: firsts, eliminated: [...seconds, ...rest], scores }
      // >2 tied for 1st: tiebreak to narrow down
      const {
        qualified: q,
        eliminated: e,
        tieBreakSteps: tbs1,
      } = this.resolvePending(firsts)
      return {
        qualified: q,
        eliminated: [...e, ...seconds, ...rest],
        scores,
        ...(tbs1.length > 0 ? { tieBreakSteps: tbs1 } : {}),
      }
    }

    // firsts.length === 1
    if (seconds.length === 0)
      return { qualified: firsts, eliminated: rest, scores }
    if (seconds.length === 1)
      return { qualified: [...firsts, ...seconds], eliminated: rest, scores }

    // seconds.length > 1: break tie for 2nd qualifying spot
    const {
      qualified: q2,
      eliminated: e2,
      tieBreakSteps: tbs2,
    } = this.resolvePending(seconds)
    return {
      qualified: [...firsts, ...q2],
      eliminated: [...e2, ...rest],
      scores,
      ...(tbs2.length > 0 ? { tieBreakSteps: tbs2 } : {}),
    }
  }
}
