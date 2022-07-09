import type { Ballot } from '../../types'
import { totalBallotsWeight } from '../../utils/normalize'
import { RandomBallotMethod } from '../../classes/random-ballot-method'

const pickBallotIdx = (ballots: Ballot[], ratio: number) => {
  const W = totalBallotsWeight(ballots)
  const pickAt = ratio * W
  let w = 0
  let i = 0

  while (w < pickAt) {
    const b = ballots[i] as Ballot | undefined
    if (!b) throw new Error('Could not pick a ballot?!')
    w += b.weight
    if (w >= pickAt) return i
    i++
  }
  throw new Error('Could not pick a ballot?!')
}

const rank = (candidates: string[], ballots: Ballot[], rng: () => number) => {
  if (candidates.length === 0) return []
  if (ballots.length === 0) return [candidates]

  const ratio = rng()
  const idx = pickBallotIdx(ballots, ratio)
  return ballots[idx].ranking
}

export class RandomDictator extends RandomBallotMethod {
  constructor(i: {
    ballots: Ballot[]
    candidates: string[]
    rng?: () => number
  }) {
    super(i)
  }

  public ranking(): string[][] {
    return rank(this.candidates, this.ballots, this.rng)
  }
}
