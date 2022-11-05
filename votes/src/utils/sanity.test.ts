import { type Ballot, methods, VotingSystem } from '..'
import { abcde, dummyProfile, dummyProfile10 } from '../test/test-utils'
import { matrixFromBallots } from './make-matrix'
import { isRandomSystem } from './categories'

const isRandomCandidate = (
  system: VotingSystem,
): system is VotingSystem.RandomCandidates =>
  VotingSystem.RandomCandidates === system

describe('sanity check', () => {
  it.each(Object.values(VotingSystem))(
    'empty list and empty candidates %p',
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
    'empty ballot list %p (ranking)',
    (system) => {
      if (isRandomSystem(system)) return

      const candidates = ['a', 'b', 'c']
      const ballots: Ballot[] = []
      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })
      expect(election.ranking()).toStrictEqual([['a', 'b', 'c']])
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty ballot list %p (scores)',
    (system) => {
      const candidates = ['a', 'b', 'c']
      const ballots: Ballot[] = []
      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })
      if ('scores' in election) {
        expect(election.scores().a).toStrictEqual(election.scores().b)
        expect(election.scores().a).toStrictEqual(election.scores().c)
      }
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty candidates list %p (ranking)',
    (system) => {
      if (isRandomCandidate(system)) return

      const election = new methods[system]({
        array: [],
        ballots: [{ ranking: [['a'], ['b'], ['c']], weight: 1 }],
        candidates: [],
      })
      expect(election.ranking()).toStrictEqual([])
    },
  )
  it.each(Object.values(VotingSystem))(
    'empty candidates list %p (scores)',
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
    'gets the winner from 1 ballot %p',
    (system) => {
      if (isRandomCandidate(system)) return

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
    'gets the 2 winners from 1 ballot %p',
    (system) => {
      if (isRandomSystem(system)) return

      const ballots = [{ ranking: [['a', 'd'], ['b'], ['c']], weight: 1 }]
      const candidates = ['a', 'b', 'c', 'd']

      const matrix = matrixFromBallots(ballots, candidates)
      const election = new methods[system]({
        ballots,
        ...matrix,
      })
      if (system === VotingSystem.AbsoluteMajority)
        expect(election.ranking()[0]).toStrictEqual(['a', 'b', 'c', 'd'])
      else expect(election.ranking()[0]).toStrictEqual(['a', 'd'])
    },
  )
  it.each(Object.values(VotingSystem))(
    'gets the condorcet cycle %p (ranking)',
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
    'gets the condorcet cycle %p (scores)',
    (system) => {
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

      if ('scores' in election) {
        expect(election.scores().a).toStrictEqual(election.scores().b)
        expect(election.scores().a).toStrictEqual(election.scores().c)
      }
    },
  )
  it.each(Object.values(VotingSystem))('dummyProfile %p', (system) => {
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

  it.each(Object.values(VotingSystem))('dummyProfile10 %p', (system) => {
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
  it.each(Object.values(VotingSystem))('gets matrix %p', (system) => {
    if (isRandomCandidate(system)) return

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
