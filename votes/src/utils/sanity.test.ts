/* eslint-disable vitest/no-conditional-expect */

import { type Ballot, methods, VotingSystem } from '..'
import {
  abcde,
  balinski,
  dummyProfile,
  dummyProfile10,
} from '../test/test-utils'
import { matrixFromBallots } from './make-matrix'
import { canonizeRanking } from './normalize'

type ABC = 'a' | 'b' | 'c'

describe('sanity check', () => {
  it.each(Object.values(VotingSystem))(
    'empty list and empty candidates %s',
    (system) => {
      if (!Object.hasOwn(methods, system)) return

      const Method = methods[system]
      const election = new Method({
        ballots: [],
        candidates: [],
      })
      expect(canonizeRanking(election.ranking())).toStrictEqual([])
      if ('scores' in election) expect(election.scores()).toStrictEqual({})
    },
  )
  it.each(Object.values(VotingSystem))('single candidate %s', (system) => {
    const ballots = [{ ranking: [['a']], weight: 1 }]
    const election = new methods[system]({ ballots, candidates: ['a'] })
    expect(election.ranking()).toStrictEqual([['a']])
  })
  it.each(Object.values(VotingSystem))(
    'empty ballot list %s (ranking)',
    (system) => {
      if (methods[system].isRandom) return

      const candidates = ['a', 'b', 'c']
      const ballots: Ballot<ABC>[] = []
      const election = new methods[system]({ ballots, candidates })
      expect(election.ranking()).toStrictEqual([['a', 'b', 'c']])
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty ballot list %s (scores)',
    (system) => {
      const candidates: ABC[] = ['a', 'b', 'c']
      const ballots: Ballot<ABC>[] = []
      const election = new methods[system]({ ballots, candidates })
      if (!('scores' in election)) return

      expect(election.scores().a).toBeCloseTo(election.scores().b, 6)
      expect(election.scores().a).toBeCloseTo(election.scores().c, 6)
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty candidates list (%s) (ranking)',
    (system) => {
      if (system === VotingSystem.RandomCandidates) return

      const election = new methods[system]({
        ballots: [{ ranking: [['a'], ['b'], ['c']], weight: 1 }],
        candidates: [],
      })
      expect(canonizeRanking(election.ranking())).toStrictEqual([])
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty candidates list %s (scores)',
    (system) => {
      const election = new methods[system]({
        ballots: [{ ranking: [['a'], ['b'], ['c']], weight: 1 }],
        candidates: [],
      })
      if ('scores' in election) expect(election.scores()).toStrictEqual({})
    },
  )
  it.each(Object.values(VotingSystem))(
    'gets the winner from 1 ballot %s',
    (system) => {
      if (system === VotingSystem.RandomCandidates) return

      const ballots = [{ ranking: [['a'], ['b'], ['c']], weight: 1 }]
      const candidates = ['a', 'b', 'c']

      const election = new methods[system]({ ballots, candidates })
      expect(election.ranking()[0]).toStrictEqual(['a'])
    },
  )
  it.each(Object.values(VotingSystem))(
    'gets the 2 winners from 1 ballot (%s)',
    (system) => {
      if (methods[system].isRandom) return

      const ballots = [{ ranking: [['a', 'd'], ['b'], ['c']], weight: 1 }]
      const candidates = ['a', 'b', 'c', 'd']

      const election = new methods[system]({ ballots, candidates })
      expect(canonizeRanking(election.ranking())[0]).toStrictEqual(
        system === VotingSystem.AbsoluteMajority
          ? ['a', 'b', 'c', 'd']
          : ['a', 'd'],
      )
    },
  )
  it.each(Object.values(VotingSystem))(
    'gets the condorcet cycle %s (ranking)',
    (system) => {
      // Exclude randomized
      if (methods[system].isRandom) return

      const candidates = ['a', 'b', 'c']
      const ballots = [
        { ranking: [['a'], ['b'], ['c']], weight: 1 },
        { ranking: [['b'], ['c'], ['a']], weight: 1 },
        { ranking: [['c'], ['a'], ['b']], weight: 1 },
      ]

      const election = new methods[system]({ ballots, candidates })

      expect(election.ranking()[0]).toStrictEqual(['a', 'b', 'c'])
    },
  )
  it.each(Object.values(VotingSystem))(
    'gets the condorcet cycle %s (scores)',
    (system) => {
      const candidates: ABC[] = ['a', 'b', 'c']
      const ballots: Ballot<ABC>[] = [
        { ranking: [['a'], ['b'], ['c']], weight: 1 },
        { ranking: [['b'], ['c'], ['a']], weight: 1 },
        { ranking: [['c'], ['a'], ['b']], weight: 1 },
      ]

      const election = new methods[system]({ ballots, candidates })

      if (!('scores' in election)) return

      expect(election.scores().a).toBeCloseTo(election.scores().b, 6)
      expect(election.scores().a).toBeCloseTo(election.scores().c, 6)
    },
  )
  it.each(Object.values(VotingSystem))('dummyProfile %s', (system) => {
    if (methods[system].isRandom) return

    const candidates = abcde
    const ballots = dummyProfile
    const election = new methods[system]({ ballots, candidates })
    expect(election.ranking()[0]).toStrictEqual(['a'])
  })

  it.each(Object.values(VotingSystem))('dummyProfile10 (%s)', (system) => {
    if (methods[system].isRandom) return

    const candidates = abcde
    const ballots = dummyProfile10
    const election = new methods[system]({ ballots, candidates })
    expect(election.ranking()[0]).toStrictEqual(['a'])
  })
  it.each(Object.values(VotingSystem).filter((s) => !methods[s].isRandom))(
    'counts a ballot without weight once (%s)',
    (system) => {
      const ranked = [
        [['a'], ['b'], ['c']],
        [['b'], ['c'], ['a']],
        [['c'], ['a'], ['b']],
        [['a'], ['c'], ['b']],
      ]
      const run = (ballots: Ballot<ABC>[]) =>
        new methods[system]({ ballots, candidates: ['a', 'b', 'c'] }).ranking()
      expect(
        run(ranked.map((ranking) => ({ ranking })) as Ballot<ABC>[]),
      ).toStrictEqual(
        run(ranked.map((ranking) => ({ ranking, weight: 1 })) as Ballot<ABC>[]),
      )
    },
  )
  it.each(Object.values(VotingSystem).filter((s) => !methods[s].isRandom))(
    'ignores a candidate given twice (%s)',
    (system) => {
      const run = (candidates: typeof abcde) =>
        new methods[system]({
          ballots: balinski,
          candidates,
          unrankedLast: false,
        }).ranking()
      expect(run([...abcde, 'a'])).toStrictEqual(run(abcde))
    },
  )
  it.each(Object.values(VotingSystem).filter((s) => !methods[s].isRandom))(
    'ignores blank ballots (%s)',
    (system) => {
      const ballots: Ballot<ABC>[] = [
        { ranking: [['a'], ['b'], ['c']], weight: 3 },
        { ranking: [['b'], ['c'], ['a']], weight: 2 },
      ]
      const blank: Ballot<ABC>[] = [{ ranking: [], weight: 2 }]
      for (const unrankedLast of [true, false]) {
        const run = (b: Ballot<ABC>[]) =>
          new methods[system]({
            ballots: b,
            candidates: ['a', 'b', 'c'],
            unrankedLast,
          }).ranking()
        expect(run([...ballots, ...blank])).toStrictEqual(run(ballots))
      }
    },
  )
  // Majority judgment's majority value counts whole votes.
  it.each(
    Object.values(VotingSystem).filter(
      (s) => !methods[s].isRandom && s !== VotingSystem.MajorityJudgment,
    ),
  )('ranks fractional weights like whole ones (%s)', (system) => {
    // a over b: 0.4 + 0.2, which floats above b over a: 0.6.
    const ballots = [
      { ranking: [['a'], ['b'], ['c']], weight: 4 },
      { ranking: [['a'], ['c'], ['b']], weight: 2 },
      { ranking: [['b'], ['a'], ['c']], weight: 6 },
    ]
    const run = (divisor: number) =>
      new methods[system]({
        candidates: ['a', 'b', 'c'],
        ballots: ballots.map((b) => ({ ...b, weight: b.weight / divisor })),
      }).ranking()
    expect(run(10)).toStrictEqual(run(1))
  })
  it.each(
    Object.values(VotingSystem).filter(
      (s) => s !== VotingSystem.RandomCandidates,
    ),
  )('rejects a negative or non-finite weight (%s)', (system) => {
    for (const weight of [-1, NaN, Infinity])
      expect(() =>
        new methods[system]({
          candidates: ['a', 'b'],
          ballots: [{ ranking: [['a'], ['b']], weight }],
        }).ranking(),
      ).toThrow(RangeError)
  })
  it.each(Object.values(VotingSystem))(
    'ranks a candidate named __proto__ (%s)',
    (system) => {
      const candidates = ['__proto__', 'b']
      const ballots = [{ ranking: [['__proto__'], ['b']] }]
      const election = new methods[system]({ ballots, candidates })
      expect(new Set(election.ranking().flat())).toStrictEqual(
        new Set(candidates),
      )
    },
  )
  it.each(Object.values(VotingSystem).filter((s) => methods[s].isRandom))(
    'draws once (%s)',
    (system) => {
      const input = { ballots: dummyProfile10, candidates: abcde }
      const method = new methods[system](input)
      expect(method.ranking()).toBe(method.ranking())
    },
  )
  it.each(Object.values(VotingSystem))('gets matrix (%s)', (system) => {
    if (
      system === VotingSystem.MajorityJudgment ||
      system === VotingSystem.RandomCandidates
    )
      return

    const candidates = abcde
    const ballots = dummyProfile10
    const election = new methods[system]({ ballots, candidates })
    expect(election.matrix).toStrictEqual(
      matrixFromBallots(ballots, candidates),
    )
  })
})
