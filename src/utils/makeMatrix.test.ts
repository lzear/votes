import { makeAntisymetric, matrixFromBallots } from '.'
import { abcde, balinski } from '../test/testUtils'

it('makes antisymetric', () => {
  expect(makeAntisymetric(matrixFromBallots(balinski, abcde))).toMatchObject({
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
