import { smithCycle } from '../../test/test-utils'
import { SmithInstantRunoff } from '.'

describe(SmithInstantRunoff, () => {
  it('runs instant runoff among the Smith set', () => {
    // C goes out first, its votes to A; then D, its votes to A too.
    const method = new SmithInstantRunoff(smithCycle)
    expect(method.rounds().map((r) => r.scores)).toStrictEqual([
      { A: 3, B: 7, C: 9, D: 5 },
      { A: 12, B: 7, D: 5 },
      { A: 17, B: 7 },
    ])
    expect(method.ranking()).toStrictEqual([['A'], ['B'], ['D'], ['C']])
  })
})
