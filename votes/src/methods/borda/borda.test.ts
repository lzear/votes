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
