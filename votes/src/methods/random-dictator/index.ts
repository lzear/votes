/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RandomBallotMethod } from '../../classes/random-ballot-method'
import { type Ballot, type ScoreObject } from '../../types'
import {
  scoresAny,
  scoresZero,
  totalBallotsWeight,
  weightOf,
} from '../../utils'
import { completeRanking } from '../../utils/normalize'

const pickBallotIdx = <C extends string>(
  ballots: Ballot<C>[],
  ratio: number,
) => {
  const pickAt = ratio * totalBallotsWeight(ballots)
  let w = 0
  for (const [i, ballot] of ballots.entries()) {
    w += weightOf(ballot)
    if (w > pickAt) return i
  }
  return ballots.length - 1
}

const rank = <C extends string>(
  candidates: C[],
  ballots: Ballot<C>[],
  rng: () => number,
): C[][] => {
  if (candidates.length === 0) return []
  // No weight to draw from: everyone ties.
  if (totalBallotsWeight(ballots) <= 0) return [candidates]

  const ratio = rng()
  const idx = pickBallotIdx(ballots, ratio)
  return completeRanking(ballots[idx]!.ranking, candidates)
}

export class RandomDictator<C extends string> extends RandomBallotMethod<C> {
  // Each candidate's chance to top the drawn ballot, shared within a tie.
  public probabilities(): ScoreObject<C> {
    const total = totalBallotsWeight(this.ballots)
    if (total <= 0)
      return scoresAny(this.candidates, 1 / this.candidates.length)
    const odds = scoresZero(this.candidates)
    for (const ballot of this.ballots) {
      const [top = []] = completeRanking(ballot.ranking, this.candidates)
      for (const c of top) odds[c] += weightOf(ballot) / top.length / total
    }
    return odds
  }

  protected draw(): C[][] {
    return rank(this.candidates, this.ballots, this.rng)
  }
}
