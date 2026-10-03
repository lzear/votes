import { smithSet } from './condorcet'
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
