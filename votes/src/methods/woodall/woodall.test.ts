import { smithCycle } from '../../test/test-utils'
import { Woodall } from '.'

describe(Woodall, () => {
  it('elects the Smith set member instant runoff puts out last', () => {
    // A goes out, then B: D is the last of the Smith set A, B and D.
    expect(new Woodall(smithCycle).ranking()).toStrictEqual([
      ['D'],
      ['C'],
      ['B'],
      ['A'],
    ])
  })

  it('elects a Condorcet winner at once', () => {
    const method = new Woodall({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b'], ['c']], weight: 2 },
        { ranking: [['b'], ['a'], ['c']], weight: 2 },
        { ranking: [['c'], ['a'], ['b']], weight: 3 },
      ],
    })
    expect(method.rounds()).toHaveLength(1)
    expect(method.ranking()).toStrictEqual([['a'], ['b', 'c']])
  })
})
