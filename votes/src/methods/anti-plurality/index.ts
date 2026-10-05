import { BallotScoreMethod } from '../../classes/ballot-score-method'
import type { Ballot, ScoreObject } from '../../types'
import { firstChoices } from '../first-past-the-post/iterate-first-choices'

const ranksAll = <C extends string>(
  { ranking }: Ballot<C>,
  candidates: Set<C>,
): boolean => {
  let ranked = 0
  for (const rank of ranking)
    for (const c of rank) if (candidates.has(c)) ranked++
  return ranked === candidates.size
}

// Minus each candidate's last places among `candidates`. Only a ballot that
// ranks them all has a last choice; with unrankedLast, any ballot that ranks
// someone does.
export const antiPluralityScores = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  unrankedLast: boolean,
): ScoreObject<C> => {
  const running = new Set(candidates)
  const complete = unrankedLast
    ? ballots
    : ballots.filter((b) => ranksAll(b, running))
  const reversed = complete.map((ballot) => ({
    ...ballot,
    ranking: ballot.ranking.toReversed(),
  }))
  const vetoes = firstChoices(reversed, candidates)
  return Object.fromEntries(
    Object.entries<number>(vetoes).map(([c, s]) => [c, -s]),
  ) as ScoreObject<C>
}

/**
 * Each voter votes against their last choice, and the fewest votes against
 * wins. Scores are minus those votes.
 *
 * #### Wikipedia: [Anti-plurality voting](https://en.wikipedia.org/wiki/Anti-plurality_voting)
 */
export class AntiPlurality<C extends string> extends BallotScoreMethod<C> {
  public static readonly label = 'AntiPlurality'

  public scores(): ScoreObject<C> {
    return antiPluralityScores(this.ballots, this.candidates, this.unrankedLast)
  }
}
