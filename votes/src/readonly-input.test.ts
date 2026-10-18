import { Borda, Election, Schulze } from '.'
import { matrixFromBallots } from './utils'

const candidates = ['a', 'b', 'c'] as const
const ballots = [
  { ranking: [['a'], ['b', 'c']], weight: 2 },
  { ranking: [['c'], ['b'], ['a']] },
] as const
const array = [
  [0, 3, 2],
  [0, 0, 2],
  [1, 1, 0],
] as const

describe('readonly input', () => {
  it('takes as const ballots and matrices', () => {
    expect(new Borda({ candidates, ballots }).ranking()).toStrictEqual([
      ['a'],
      ['c'],
      ['b'],
    ])
    expect(new Schulze({ candidates, array }).ranking()).toStrictEqual([
      ['a'],
      ['b'],
      ['c'],
    ])
    expect(
      new Election({ candidates, ballots, methods: [Schulze] }).ranking(),
    ).toStrictEqual(new Schulze({ candidates, ballots }).ranking())
    expect(matrixFromBallots(ballots, candidates).array).toStrictEqual([
      [0, 2, 2],
      [1, 0, 0],
      [1, 1, 0],
    ])
  })
})
