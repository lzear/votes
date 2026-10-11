import { fromMargins } from '../../test/test-utils'
import { SplitCycle } from '.'

describe(SplitCycle, () => {
  it('leaves the weakest win of each cycle undecided', () => {
    // Holliday & Pacuit, Stable Voting, Example 3: A defeats D and B, D
    // defeats C; C's win over A and B's over C are each a cycle's weakest.
    const method = new SplitCycle(
      fromMargins(
        ['A', 'B', 'C', 'D'],
        [
          ['A', 'D', 12],
          ['D', 'C', 10],
          ['C', 'A', 8],
          ['A', 'B', 6],
          ['B', 'C', 4],
          ['D', 'B', 2],
        ],
      ),
    )
    expect(method.ranking()).toStrictEqual([['A'], ['B', 'D'], ['C']])
  })

  it('elects the only immune candidate', () => {
    // Electowiki, Immune set: A beats B, B beats C, C beats A; B's beatpath
    // back to A is stronger than A's win.
    const method = new SplitCycle({
      candidates: ['A', 'B', 'C', 'D'],
      ballots: [
        { ranking: [['A'], ['B']], weight: 26 },
        { ranking: [['B']], weight: 25 },
        { ranking: [['C']], weight: 49 },
        { ranking: [['D']], weight: 10 },
      ],
    })
    expect(method.ranking()[0]).toStrictEqual(['B'])
  })

  it('ties a cycle of equal margins', () => {
    const method = new SplitCycle(
      fromMargins(
        ['a', 'b', 'c'],
        [
          ['a', 'b', 1],
          ['b', 'c', 1],
          ['c', 'a', 1],
        ],
      ),
    )
    expect(method.ranking()).toStrictEqual([['a', 'b', 'c']])
  })
})
