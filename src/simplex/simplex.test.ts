import { solve } from './index'
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
    0.3333333333333333,
    0.3333333333333333,
    0.3333333333333333,
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
    0.3333333333333333,
    0.3333333333333333,
    0.3333333333333333,
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
    0.2857142857142857,
    0.5714285714285714,
    0.14285714285714285,
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
    0,
    0.2857142857142857,
    0.5714285714285714,
    0.14285714285714285,
    0,
  ])
  expect(productVectM(s, input)).toEqual([4, 0, 0, 0, 3.714285714285714])
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
    0.6923076923076924,
    -0.07692307692307701,
    -4.2700885562506035e-17,
    0,
    0.38461538461538475,
  ])
})
