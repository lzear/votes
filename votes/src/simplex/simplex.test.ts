/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { productVectM } from '../test/matrix'
import { findNashEquilibrium } from './find-nash-equilibrium'

const closeToArray = (received: number[], expected: number[], digits = 6) => {
  expect(received).toHaveLength(expected.length)
  for (let i = 0; i < expected.length; i++)
    expect(received[i]).toBeCloseTo(expected[i]!, digits)
}

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
  closeToArray(s, [1 / 3, 1 / 3, 1 / 3])
  for (const v of productVectM(s, input)) expect(v).toBeCloseTo(0)
})

it('solves 4', () => {
  const input = [
    [0, 1, -1, 1],
    [-1, 0, 1, 1],
    [1, -1, 0, 1],
    [-1, -1, -1, 0],
  ]
  const s = findNashEquilibrium(input)
  closeToArray(s, [1 / 3, 1 / 3, 1 / 3, 0])
  expect(productVectM(s, input)[3]).toBeCloseTo(1)
})

it('solves example1', () => {
  const input = [
    [0, -2, 8],
    [2, 0, -4],
    [-8, 4, 0],
  ]
  const s = findNashEquilibrium(input)
  closeToArray(s, [2 / 7, 4 / 7, 1 / 7])
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
  closeToArray(s, [0, 2 / 7, 4 / 7, 1 / 7, 0])
  const prod = productVectM(s, input)
  expect(prod[0]).toBeCloseTo(4)
  expect(prod[1]).toBeCloseTo(0)
  expect(prod[2]).toBeCloseTo(0)
  expect(prod[3]).toBeCloseTo(0)
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
  closeToArray(s, [3 / 11, 0, 1 / 11, 0, 7 / 11])
  const prod = productVectM(s, input)
  expect(prod[0]).toBeCloseTo(0)
  expect(prod[2]).toBeCloseTo(0)
  expect(prod[4]).toBeCloseTo(0)
})
