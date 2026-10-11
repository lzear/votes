import { fromMargins } from '../../test/test-utils'
import { StableVoting } from '.'

describe(StableVoting, () => {
  it('elects the winner without a loser it beats by the most', () => {
    // Holliday & Pacuit, Stable Voting, Example 3: A wins without B.
    const method = new StableVoting(
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
    expect(method.ranking()[0]).toStrictEqual(['A'])
  })

  it('takes a lost match its loser does not defeat', () => {
    // Example 2, the Smith set of Glasgow 2007, Govan: Dornan wins against
    // Flanagan without Hunter, who beats Dornan by the smallest margin.
    const method = new StableVoting(
      fromMargins(
        ['Dornan', 'Flanagan', 'Hunter'],
        [
          ['Dornan', 'Flanagan', 602],
          ['Flanagan', 'Hunter', 86],
          ['Hunter', 'Dornan', 21],
        ],
      ),
    )
    expect(method.ranking()).toStrictEqual([
      ['Dornan'],
      ['Flanagan'],
      ['Hunter'],
    ])
  })

  it('elects D from ballots', () => {
    // Electowiki, Stable Voting: D wins against A without B.
    const method = new StableVoting({
      candidates: ['A', 'B', 'D'],
      ballots: [
        { ranking: [['A'], ['B'], ['D']], weight: 30 },
        { ranking: [['D'], ['A'], ['B']], weight: 25 },
        { ranking: [['D'], ['B'], ['A']], weight: 23 },
        { ranking: [['B'], ['D'], ['A']], weight: 21 },
      ],
    })
    expect(method.ranking()[0]).toStrictEqual(['D'])
  })

  it('ties a cycle of equal margins', () => {
    const method = new StableVoting(
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

  it('throws beyond maxCandidates', () => {
    const candidates = ['a', 'b', 'c']
    expect(() =>
      new StableVoting({ candidates, ballots: [], maxCandidates: 2 }).scores(),
    ).toThrow(RangeError)
  })
})
