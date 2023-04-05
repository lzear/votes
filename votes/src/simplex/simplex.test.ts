import { findNashEquilibrium } from './find-nash-equilibrium'
import { productVectM } from '../test/matrix'

it('solves 2', () => {
  const input = [
    [0, 1],
    [-1, 0],
  ]
  const s = findNashEquilibrium(input)
  expect(s).toEqual([1, 0])
  expect(productVectM(s, input)).toEqual([0, 1])
})

it('solves 3', () => {
  const input = [
    [0, 1, -1],
    [-1, 0, 1],
    [1, -1, 0],
  ]
  const s = findNashEquilibrium(input)
  expect(s).toEqual([
    0.333_333_333_333_333_3, 0.333_333_333_333_333_3, 0.333_333_333_333_333_3,
  ])
  expect(productVectM(s, input)).toEqual([0, 0, 0])
})

it('solves 4', () => {
  const input = [
    [0, 1, -1, 1],
    [-1, 0, 1, 1],
    [1, -1, 0, 1],
    [-1, -1, -1, 0],
  ]
  const s = findNashEquilibrium(input)
  expect(s).toEqual([
    0.333_333_333_333_333_3, 0.333_333_333_333_333_3, 0.333_333_333_333_333_3,
    0,
  ])
  expect(productVectM(s, input)).toEqual([0, 0, 0, 1])
})

it('solves example1', () => {
  const input = [
    [0, -2, 8],
    [2, 0, -4],
    [-8, 4, 0],
  ]
  const s = findNashEquilibrium(input)
  expect(s).toEqual([0.285_714_29, 0.571_428_57, 0.142_857_14])
  for (const v of productVectM(s, input)) expect(v).toBeCloseTo(0)
})

it('solves example2', () => {
  const input = [
    [0, -4, -4, -4, -4],
    [4, 0, -2, 8, 6],
    [4, 2, 0, -4, 2],
    [4, -8, 4, 0, 6],
    [4, -6, -2, -6, 0],
  ]
  const s = findNashEquilibrium(input)
  expect(s).toEqual([0, 0.285_714_29, 0.571_428_57, 0.142_857_14, 0])
  expect(productVectM(s, input)).toEqual([
    4, 2.000_000_010_049_518_6e-8, -1.999_999_998_947_288_3e-8,
    3.999_999_975_690_116e-8, 3.714_285_719_999_999_5,
  ])
})

it('solves example3', () => {
  const input = [
    [0, -5, 7, 15, -1],
    [5, 0, -13, 21, -9],
    [-7, 13, 0, -11, 3],
    [-15, -21, 11, 0, -22],
    [1, 9, -3, 22, 0],
  ]
  const s = findNashEquilibrium(input)
  expect(s).toEqual([0.272_727_27, 0, 0.090_909_09, 0, 0.636_363_64])
  expect(productVectM(s, input)).toMatchInlineSnapshot(`
    [
      1.0000000050247593e-8,
      5.5454545799999995,
      -3.0000000039720476e-8,
      17.09090914,
      -5.551115123125783e-17,
    ]
  `)
})
