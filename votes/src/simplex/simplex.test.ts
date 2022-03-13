import { solve } from '.'
import { productVectM } from '../test/matrix'

it('solves 2', () => {
  const input = [
    [0, 1],
    [-1, 0],
  ]
  const s = solve(input)
  expect(s).toEqual([1, 0])
  expect(productVectM(s, input)).toEqual([0, 1])
})

it('solves 3', () => {
  const input = [
    [0, 1, -1],
    [-1, 0, 1],
    [1, -1, 0],
  ]
  const s = solve(input)
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
  const s = solve(input)
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
  const s = solve(input)
  expect(s).toEqual([
    0.285_714_285_714_285_7, 0.571_428_571_428_571_4, 0.142_857_142_857_142_85,
  ])
  expect(productVectM(s, input)).toEqual([0, 0, 0])
})

it('solves example2', () => {
  const input = [
    [0, -4, -4, -4, -4],
    [4, 0, -2, 8, 6],
    [4, 2, 0, -4, 2],
    [4, -8, 4, 0, 6],
    [4, -6, -2, -6, 0],
  ]
  const s = solve(input)
  expect(s).toEqual([
    0, 0.285_714_285_714_285_7, 0.571_428_571_428_571_4,
    0.142_857_142_857_142_85, 0,
  ])
  expect(productVectM(s, input)).toEqual([4, 0, 0, 0, 3.714_285_714_285_714])
})

it.skip('solves example3', () => {
  const input = [
    [0, -5, 7, 15, -1],
    [5, 0, -13, 21, -9],
    [-7, 13, 0, -11, 3],
    [-15, -21, 11, 0, -22],
    [1, 9, -3, 22, 0],
  ]
  const s = solve(input)
  expect(s).toEqual([1, 0])
  expect(productVectM(s, input)).toEqual([
    0.692_307_692_307_692_4, -0.076_923_076_923_077_01,
    -4.270_088_556_250_603_5e-17, 0, 0.384_615_384_615_384_75,
  ])
})
