import { abcde, balinski } from '../../test/test-utils'
import { Borda } from '.'

describe(Borda, () => {
  it('scores', () => {
    const election = new Borda({ candidates: abcde, ballots: balinski })
    expect(election.scores()).toStrictEqual({
      a: 235,
      b: 347,
      c: 344,
      d: 292,
      e: 282,
    })
  })

  it('ranks', () => {
    const election = new Borda({ candidates: abcde, ballots: balinski })
    expect(election.ranking()).toStrictEqual([
      ['b'],
      ['c'],
      ['d'],
      ['e'],
      ['a'],
    ])
  })

  it('scores only expressed preferences with unrankedLast: false', () => {
    const partial: { ranking: string[][]; weight: number }[] = [
      { ranking: [['a'], ['b']], weight: 1 },
    ]
    // Default: unranked candidates join as one tied bottom tier.
    const withBottom = new Borda({ candidates: abcde, ballots: partial })
    // c, d, e share the bottom tier -> average of 3rd/4th/5th place points.
    expect(withBottom.scores()).toStrictEqual({ a: 5, b: 4, c: 2, d: 2, e: 2 })
    // Opt out: unranked candidates earn nothing from that ballot.
    const expressedOnly = new Borda({
      candidates: abcde,
      ballots: partial,
      unrankedLast: false,
    })
    expect(expressedOnly.scores()).toStrictEqual({
      a: 5,
      b: 4,
      c: 0,
      d: 0,
      e: 0,
    })
  })

  it('has candidates', () => {
    const election = new Borda({ candidates: abcde, ballots: balinski })
    expect(election.candidates).toStrictEqual(abcde)
  })

  it('makes matrix', () => {
    const election = new Borda({ candidates: abcde, ballots: balinski })
    expect(election.matrix).toStrictEqual({
      array: [
        [0, 33, 33, 33, 36],
        [67, 0, 49, 79, 52],
        [67, 51, 0, 66, 60],
        [67, 21, 34, 0, 70],
        [64, 48, 40, 30, 0],
      ],
      candidates: ['a', 'b', 'c', 'd', 'e'],
    })
    expect(election.matrix).toStrictEqual(election.matrix)
  })
})
