import { performPivots, simplexTableau } from '../../simplex'
import { matrixString } from '../../simplex/utils'
import ml from './index'

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
      ml.computeFromMatrix({ candidates: ['a', 'b', 'c'], array: example1 }),
    ).toEqual({
      a: 0.2857142857142857,
      b: 0.5714285714285714,
      c: 0.14285714285714285,
    })
  })
  it('works with "complexer" example', () => {
    expect(ml.computeFromMatrix({ candidates, array: example2 })).toEqual({
      a: 0,
      b: 0.2857142857142857,
      c: 0.5714285714285714,
      d: 0.14285714285714285,
      e: 0,
    })
  })
  it('works with "example3" example', () => {
    expect(
      ml.computeFromMatrix({
        candidates: ['a', 'b', 'c', 'd', 'e'],
        array: example3,
      }),
    ).toEqual({
      a: 0.6428571428571428,
      b: 0,
      c: 0,
      d: 0,
      e: 0.3571428571428572,
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
