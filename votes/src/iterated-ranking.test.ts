import { Election } from './election'
import { Borda } from './methods/borda'
import { Copeland } from './methods/copeland'
import { FirstPastThePost } from './methods/first-past-the-post'
import { InstantRunoff } from './methods/instant-runoff'
import { RandomCandidates } from './methods/random-candidates'
import type { Ballot } from './types'
import { matrixFromBallots } from './utils'
import { rngGenerator } from './utils/rng-generator'

const abc = ['a', 'b', 'c']

describe('iteratedRanking', () => {
  it('re-scores the remaining candidates once the winner is out (Borda)', () => {
    const ballots: Ballot<string>[] = [
      { ranking: [['a'], ['b'], ['c']], weight: 3 },
      { ranking: [['b'], ['c'], ['a']], weight: 2 },
      { ranking: [['c'], ['b'], ['a']], weight: 2 },
    ]
    const borda = new Borda({ candidates: abc, ballots })

    // Full Borda leaves a and c tied behind b...
    expect(borda.ranking()).toStrictEqual([['b'], ['a', 'c']])
    // ...but with b gone, c beats a head-to-head.
    expect(borda.iteratedRanking()).toStrictEqual([['b'], ['c'], ['a']])
  })

  it('differs from elimination order (instant runoff)', () => {
    const ballots: Ballot<string>[] = [
      { ranking: [['a'], ['b'], ['c']], weight: 8 },
      { ranking: [['b'], ['a'], ['c']], weight: 5 },
      { ranking: [['c'], ['b'], ['a']], weight: 7 },
    ]
    const irv = new InstantRunoff({ candidates: abc, ballots })

    // Regular ranking orders losers by elimination time: b out first.
    expect(irv.ranking()).toStrictEqual([['a'], ['c'], ['b']])
    // Iterated: with a gone, b beats c outright.
    expect(irv.iteratedRanking()).toStrictEqual([['a'], ['b'], ['c']])
  })

  it('works on matrix methods via subMatrix (Copeland)', () => {
    const ballots: Ballot<string>[] = [
      { ranking: [['a'], ['b'], ['c']], weight: 2 },
      { ranking: [['b'], ['c'], ['a']], weight: 1 },
    ]
    const copeland = new Copeland(matrixFromBallots(ballots, abc))
    expect(copeland.iteratedRanking()).toStrictEqual([['a'], ['b'], ['c']])
  })

  it('terminates on a full tie', () => {
    const ballots: Ballot<string>[] = [
      { ranking: [['a'], ['b']], weight: 1 },
      { ranking: [['b'], ['a']], weight: 1 },
    ]
    const borda = new Borda({ candidates: ['a', 'b'], ballots })
    expect(borda.iteratedRanking()).toStrictEqual([['a', 'b']])
  })

  it('keeps the seeded rng across iterations (random methods)', () => {
    const make = () =>
      new RandomCandidates({ candidates: abc, rng: rngGenerator('seed') })
    expect(make().iteratedRanking()).toStrictEqual(make().iteratedRanking())
    expect(
      make()
        .iteratedRanking()
        .flat()
        .toSorted((x, y) => x.localeCompare(y)),
    ).toStrictEqual(abc)
  })

  it('re-runs the whole ranker chain per place (Election)', () => {
    const ballots: Ballot<string>[] = [
      { ranking: [['a'], ['b'], ['c']], weight: 3 },
      { ranking: [['b'], ['c'], ['a']], weight: 2 },
      { ranking: [['c'], ['b'], ['a']], weight: 2 },
    ]
    const election = new Election({
      rankers: [
        new Borda({ candidates: abc, ballots }),
        new FirstPastThePost({ candidates: abc, ballots }),
      ],
    })

    // Regular: FPTP breaks the a/c tie in favor of a (3 firsts vs 2).
    expect(election.ranking()).toStrictEqual([['b'], ['a'], ['c']])
    // Iterated: the restricted Borda re-run puts c ahead of a.
    expect(election.iteratedRanking()).toStrictEqual([['b'], ['c'], ['a']])
  })

  it('throws when an Election ranker cannot be restricted', () => {
    const fixed = { ranking: () => [['a'], ['b'], ['c']] }
    const election = new Election({ rankers: [fixed] })
    expect(() => election.iteratedRanking()).toThrow(
      /does not support restrict/,
    )
  })
})
