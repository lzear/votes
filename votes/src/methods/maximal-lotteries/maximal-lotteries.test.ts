import { performPivots, simplexTableau } from '../../simplex'
import { matrixString } from '../../test/test-utils'
import { MaximalLotteries } from './index'

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
      a: 0.285_714_285_714_285_7,
      b: 0.571_428_571_428_571_4,
      c: 0.142_857_142_857_142_85,
    })
  })
  it('works with "complexer" example', () => {
    expect(
      new MaximalLotteries({ array: example2, candidates }).scores(),
    ).toEqual({
      a: 0,
      b: 0.285_714_285_714_285_7,
      c: 0.571_428_571_428_571_4,
      d: 0.142_857_142_857_142_85,
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
      a: 0.642_857_142_857_142_8,
      b: 0,
      c: 0,
      d: 0,
      e: 0.357_142_857_142_857_2,
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
  it('tableau', () => {
    expect(matrixString(simplexTableau(example1))).toEqual(`
     0     -1     -1     -1      1      0      0      0      0      1
     0      0     -2      8      0      1      0      0      0      0
     0      2      0     -4      0      0      1      0      0      0
     0     -8      4      0      0      0      0      1      0      0
     1      1      1      1      0      0      0      0      1      0`)
  })
  it('no row', () => {
    expect(() => performPivots(simplexTableau(example1), [1, 2, 3, 4])).toThrow(
      'no row no pivot',
    )
  })
})
