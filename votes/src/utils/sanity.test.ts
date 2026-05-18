/* eslint-disable vitest/no-conditional-expect */

import { type Ballot, methods, VotingSystem } from '..'
import { abcde, dummyProfile, dummyProfile10 } from '../test/test-utils'
import { isRandomSystem } from './categories'
import { matrixFromBallots } from './make-matrix'

type ABC = 'a' | 'b' | 'c'

describe('sanity check', () => {
  it.each(Object.values(VotingSystem))(
    'empty list and empty candidates %s',
    (system) => {
      if (system in methods) {
        const Method = methods[system]
        const election = new Method({
          array: [],
          ballots: [],
          candidates: [],
        })
        expect(election.ranking()).toStrictEqual([])
        if ('scores' in election) expect(election.scores()).toStrictEqual({})
      }
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty ballot list %s (ranking)',
    (system) => {
      if (isRandomSystem(system)) return

      const candidates = ['a', 'b', 'c']
      const ballots: Ballot<ABC>[] = []
      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })
      expect(election.ranking()).toStrictEqual([['a', 'b', 'c']])
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty ballot list %s (scores)',
    (system) => {
      const candidates: ABC[] = ['a', 'b', 'c']
      const ballots: Ballot<ABC>[] = []
      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })
      if ('scores' in election) {
        expect(election.scores().a).toBeCloseTo(election.scores().b, 6)
        expect(election.scores().a).toBeCloseTo(election.scores().c, 6)
      }
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty candidates list (%s) (ranking)',
    (system) => {
      if (system === VotingSystem.RandomCandidates) return

      const election = new methods[system]({
        array: [],
        ballots: [{ ranking: [['a'], ['b'], ['c']], weight: 1 }],
        candidates: [],
      })
      expect(election.ranking()).toStrictEqual([])
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty candidates list %s (scores)',
    (system) => {
      const election = new methods[system]({
        array: [],
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

      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })
      expect(election.ranking()[0]).toStrictEqual(['a'])
    },
  )
  it.each(Object.values(VotingSystem))(
    'gets the 2 winners from 1 ballot (%s)',
    (system) => {
      if (isRandomSystem(system)) return

      const ballots = [{ ranking: [['a', 'd'], ['b'], ['c']], weight: 1 }]
      const candidates = ['a', 'b', 'c', 'd']

      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })
      expect(election.ranking()[0]).toStrictEqual(
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
      if (isRandomSystem(system)) return

      const candidates = ['a', 'b', 'c']
      const ballots = [
        { ranking: [['a'], ['b'], ['c']], weight: 1 },
        { ranking: [['b'], ['c'], ['a']], weight: 1 },
        { ranking: [['c'], ['a'], ['b']], weight: 1 },
      ]

      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })

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

      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })

      if ('scores' in election) {
        expect(election.scores().a).toBeCloseTo(election.scores().b, 6)
        expect(election.scores().a).toBeCloseTo(election.scores().c, 6)
      }
    },
  )
  it.each(Object.values(VotingSystem))('dummyProfile %s', (system) => {
    if (isRandomSystem(system)) return

    const candidates = abcde
    const ballots = dummyProfile
    const matrix = matrixFromBallots(ballots, candidates)
    const election = new methods[system]({
      ballots,
      ...matrix,
    })
    expect(election.ranking()[0]).toStrictEqual(['a'])
  })

  it.each(Object.values(VotingSystem))('dummyProfile10 (%s)', (system) => {
    if (isRandomSystem(system)) return

    const candidates = abcde
    const ballots = dummyProfile10
    const matrix = matrixFromBallots(ballots, candidates)
    const election = new methods[system]({
      ballots,
      ...matrix,
    })
    expect(election.ranking()[0]).toStrictEqual(['a'])
  })
  it.each(Object.values(VotingSystem))('gets matrix (%s)', (system) => {
    if (
      system === VotingSystem.MajorityJudgment ||
      system === VotingSystem.RandomCandidates
    )
      return

    const candidates = abcde
    const ballots = dummyProfile10
    const matrix = matrixFromBallots(ballots, candidates)
    const election = new methods[system]({
      ballots,
      ...matrix,
    })
    expect(election.matrix).toStrictEqual(matrix)
  })
})
