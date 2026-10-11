import { smithCycle } from '../../test/test-utils'
import { TidemanAlternative } from '.'

describe(TidemanAlternative, () => {
  it('narrows to the Smith set before each count', () => {
    // C is out of the Smith set, then D has the fewest first choices; A
    // then beats B.
    const method = new TidemanAlternative(smithCycle)
    expect(method.rounds().map((r) => r.eliminated)).toStrictEqual([
      ['C'],
      ['D'],
      ['B'],
    ])
    expect(method.ranking()).toStrictEqual([['A'], ['B'], ['D'], ['C']])
  })

  it('narrows to the Schwartz set', () => {
    // A ties D but no one beats A: the Schwartz set is A alone.
    const method = new TidemanAlternative({ ...smithCycle, topSet: 'schwartz' })
    expect(method.ranking()).toStrictEqual([['A'], ['B', 'C', 'D']])
  })

  it('elects a Condorcet winner', () => {
    // Instant runoff would put b out first.
    const method = new TidemanAlternative({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b'], ['c']], weight: 34 },
        { ranking: [['b'], ['a']], weight: 32 },
        { ranking: [['c'], ['b'], ['a']], weight: 34 },
      ],
    })
    expect(method.ranking()[0]).toStrictEqual(['b'])
  })
})
