import { makeAntisymetric, matrixFromBallots } from '.'
import { abcde, balinski } from '../test/test-utils'
import { subMatrix } from './make-matrix'

describe('matrixes', () => {
  it('makes antisymetric', () => {
    expect(makeAntisymetric(matrixFromBallots(balinski, abcde))).toStrictEqual({
      array: [
        [0, -34, -34, -34, -28],
        [34, 0, -2, 58, 4],
        [34, 2, 0, 32, 20],
        [34, -58, -32, 0, 40],
        [28, -4, -20, -40, 0],
      ],
      candidates: ['a', 'b', 'c', 'd', 'e'],
    })
  })

  it('makes matrix', () => {
    const m = matrixFromBallots(balinski, abcde)

    expect(m).toStrictEqual({
      array: [
        [0, 33, 33, 33, 36],
        [67, 0, 49, 79, 52],
        [67, 51, 0, 66, 60],
        [67, 21, 34, 0, 70],
        [64, 48, 40, 30, 0],
      ],
      candidates: ['a', 'b', 'c', 'd', 'e'],
    })
  })
  it('makes submatrixes', () => {
    const m = matrixFromBallots(balinski, abcde)

    expect(subMatrix(m, ['a'])).toStrictEqual({
      array: [[0]],
      candidates: ['a'],
    })
    expect(subMatrix(m, ['a', 'b'])).toStrictEqual({
      array: [
        [0, 33],
        [67, 0],
      ],
      candidates: ['a', 'b'],
    })
    expect(subMatrix(m, ['b', 'a'])).toStrictEqual({
      array: [
        [0, 33],
        [67, 0],
      ],
      candidates: ['a', 'b'],
    })
  })
  it('throws when making submatrix from missing candidates', () => {
    const m = matrixFromBallots(balinski, abcde)

    expect(() => subMatrix(m, ['f'])).toThrow()
  })
})
