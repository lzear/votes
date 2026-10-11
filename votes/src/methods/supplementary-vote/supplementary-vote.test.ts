import { TwoRoundRunoff } from '../two-round-runoff'
import { SupplementaryVote } from '.'

// C and D voters rank B third: B wins the contingent vote, which counts it.
const profile = {
  candidates: ['A', 'B', 'C', 'D'],
  ballots: [
    { ranking: [['A'], ['B'], ['C']], weight: 40 },
    { ranking: [['B'], ['A'], ['C']], weight: 35 },
    { ranking: [['C'], ['D'], ['B']], weight: 15 },
    { ranking: [['D'], ['C'], ['B']], weight: 10 },
  ],
}

describe(SupplementaryVote, () => {
  it('counts only first and second preferences', () => {
    const method = new SupplementaryVote(profile)
    expect(method.rounds().map((r) => r.scores)).toStrictEqual([
      { A: 40, B: 35, C: 15, D: 10 },
      { A: 40, B: 35 },
    ])
    expect(method.ranking()).toStrictEqual([['A'], ['B'], ['C', 'D']])
    expect(new TwoRoundRunoff(profile).ranking()[0]).toStrictEqual(['B'])
  })

  it('counts more preferences with `preferences`', () => {
    const method = new SupplementaryVote({ ...profile, preferences: 3 })
    expect(method.ranking()[0]).toStrictEqual(['B'])
  })

  it('counts a tie for second as second preferences', () => {
    const method = new SupplementaryVote({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b']], weight: 4 },
        { ranking: [['b'], ['a']], weight: 3 },
        { ranking: [['c'], ['a', 'b']], weight: 2 },
      ],
    })
    expect(method.rounds()[1]?.scores).toStrictEqual({ a: 5, b: 4 })
  })
})
