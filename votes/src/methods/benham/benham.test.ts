import { smithCycle } from '../../test/test-utils'
import { Benham } from '.'

describe(Benham, () => {
  it('averts a center squeeze', () => {
    // Electowiki, Benham's method: instant runoff puts B out and elects A;
    // B beats both 66 to 34.
    const method = new Benham({
      candidates: ['A', 'B', 'C'],
      ballots: [
        { ranking: [['A'], ['B'], ['C']], weight: 34 },
        { ranking: [['B'], ['A']], weight: 32 },
        { ranking: [['C'], ['B'], ['A']], weight: 34 },
      ],
    })
    expect(method.ranking()).toStrictEqual([['B'], ['A', 'C']])
  })

  it('elects who beats everyone left once A is out', () => {
    const method = new Benham(smithCycle)
    expect(method.rounds().map((r) => r.eliminated)).toStrictEqual([
      ['A'],
      ['C', 'D'],
    ])
    expect(method.ranking()).toStrictEqual([['B'], ['C', 'D'], ['A']])
  })
})
