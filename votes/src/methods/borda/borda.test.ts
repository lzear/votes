import { Borda } from '.'
import { abcde, balinski } from '../../test/test-utils'

describe(Borda, () => {
  it('gets score', () => {
    const election = new Borda({ candidates: abcde, ballots: balinski })
    expect(election.scores()).toStrictEqual({
      a: 235,
      b: 347,
      c: 344,
      d: 292,
      e: 282,
    })

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
