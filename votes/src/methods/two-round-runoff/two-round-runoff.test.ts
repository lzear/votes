import { TwoRoundRunoff } from '.'

describe(TwoRoundRunoff, () => {
  it('skips empty votes', () => {
    expect(
      new TwoRoundRunoff({
        candidates: ['a'],
        ballots: [{ weight: 1, ranking: [] }],
      }).ranking(),
    ).toStrictEqual([['a']])
  })

  it('does not solve absolute ties', () => {
    expect(
      new TwoRoundRunoff({
        candidates: ['a', 'b', 'c'],
        ballots: [{ weight: 1, ranking: [['a', 'b', 'c']] }],
      }).ranking(),
    ).toStrictEqual([['a', 'b', 'c']])
  })
})
