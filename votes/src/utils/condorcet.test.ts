import { condorcetWinner, smithSet } from './condorcet'
import { matrixFromBallots } from './make-matrix'

it('finds the Smith set from ballots or a matrix', () => {
  // a, b and c beat each other in a cycle, and each beats d.
  const ballots = [
    { ranking: [['a'], ['b'], ['c'], ['d']], weight: 1 },
    { ranking: [['b'], ['c'], ['a'], ['d']], weight: 1 },
    { ranking: [['c'], ['a'], ['b'], ['d']], weight: 1 },
  ]
  const candidates = ['a', 'b', 'c', 'd']
  expect(smithSet({ candidates, ballots })).toStrictEqual(['a', 'b', 'c'])
  expect(smithSet(matrixFromBallots(ballots, candidates))).toStrictEqual([
    'a',
    'b',
    'c',
  ])
})

it('finds the Condorcet winner, if any', () => {
  const candidates = ['a', 'b', 'c']
  const cycle = [
    { ranking: [['a'], ['b'], ['c']] },
    { ranking: [['b'], ['c'], ['a']] },
    { ranking: [['c'], ['a'], ['b']] },
  ]
  expect(condorcetWinner({ candidates, ballots: cycle })).toBeUndefined()
  const ballots = [...cycle, { ranking: [['b'], ['a'], ['c']], weight: 2 }]
  expect(condorcetWinner({ candidates, ballots })).toBe('b')
  expect(condorcetWinner(matrixFromBallots(ballots, candidates))).toBe('b')
  // A tie with b is no win.
  const tied = [{ ranking: [['a', 'b'], ['c']] }]
  expect(condorcetWinner({ candidates, ballots: tied })).toBeUndefined()
})
