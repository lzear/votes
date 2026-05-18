import { closeTo, matrixString } from '../../test/test-utils'
import { MaximalLotteries } from '.'

const example1 = [
  [0, -2, 8],
  [2, 0, -4],
  [-8, 4, 0],
]

const example2 = [
  [0, -4, -4, -4, -4],
  [4, 0, -2, 8, 6],
  [4, 2, 0, -4, 2],
  [4, -8, 4, 0, 6],
  [4, -6, -2, -6, 0],
]

const example3 = [
  [0, -5, 7, 15, -1],
  [5, 0, -13, 21, -9],
  [-7, 13, 0, -11, 3],
  [-15, -21, 11, 0, -22],
  [1, 9, -3, 22, 0],
]

const candidates = ['a', 'b', 'c', 'd', 'e']

describe('maximal lotteries', () => {
  it('works with "simple" example', () => {
    expect(
      new MaximalLotteries({
        array: example1,
        candidates: ['a', 'b', 'c'],
      }).scores(),
    ).toEqual({
      a: closeTo(2 / 7, 6),
      b: closeTo(4 / 7, 6),
      c: closeTo(1 / 7, 6),
    })
  })
  it('works with "complexer" example', () => {
    expect(
      new MaximalLotteries({ array: example2, candidates }).scores(),
    ).toEqual({
      a: 0,
      b: closeTo(2 / 7, 6),
      c: closeTo(4 / 7, 6),
      d: closeTo(1 / 7, 6),
      e: 0,
    })
  })
  it('works with "example3" example', () => {
    expect(
      new MaximalLotteries({
        array: example3,
        candidates: ['a', 'b', 'c', 'd', 'e'],
      }).scores(),
    ).toEqual({
      a: closeTo(3 / 11, 6),
      b: 0,
      c: closeTo(1 / 11, 6),
      d: 0,
      e: closeTo(7 / 11, 6),
    })
  })
})

describe('pivot', () => {
  it('matrixString', () => {
    expect(matrixString(example1)).toEqual(`
     0     -2      8
     2      0     -4
    -8      4      0`)
  })
})
