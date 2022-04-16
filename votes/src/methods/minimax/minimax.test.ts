import { Minimax } from '.'
import { abcde, balinski } from '../../test/test-utils'
import { matrixFromBallots } from '../../utils'

describe(Minimax, () => {
  it('scores', () => {
    const election = new Minimax(matrixFromBallots(balinski, abcde))
    expect(election.scores()).toStrictEqual({
      a: -34,
      b: -2,
      c: -0,
      d: -58,
      e: -40,
    })
  })

  it('ranks', () => {
    const election = new Minimax(matrixFromBallots(balinski, abcde))
    expect(election.ranking()).toStrictEqual([
      ['c'],
      ['b'],
      ['a'],
      ['e'],
      ['d'],
    ])
  })

  it('has candidates', () => {
    const election = new Minimax(matrixFromBallots(balinski, abcde))
    expect(election.candidates).toStrictEqual(abcde)
  })

  it('makes matrix', () => {
    const election = new Minimax(matrixFromBallots(balinski, abcde))
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
