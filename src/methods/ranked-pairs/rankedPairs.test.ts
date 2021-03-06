import { rankedPairs } from './index'

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

describe('ranked pairs', () => {
  it('works with "simple" example', () => {
    expect(
      rankedPairs.computeFromMatrix({
        array: example1,
        candidates: ['a', 'b', 'c'],
      }),
    ).toEqual({
      a: 3,
      b: 1,
      c: 2,
    })
  })
  it('works with "complexer" example', () => {
    expect(
      rankedPairs.computeFromMatrix({ array: example2, candidates }),
    ).toEqual({
      a: 1,
      b: 5,
      c: 3,
      d: 4,
      e: 2,
    })
  })
  it('works with "example3" example', () => {
    expect(
      rankedPairs.computeFromMatrix({
        array: example3,
        candidates: ['a', 'b', 'c', 'd', 'e'],
      }),
    ).toEqual({
      a: 5,
      b: 2,
      c: 4,
      d: 1,
      e: 3,
    })
  })
  it('completes computation in decent time', () => {
    expect(
      rankedPairs.computeFromMatrix({
        array: [
          [0, 1, -1, -1, -1, -1, 1, -1, 1],
          [-1, 0, -1, 1, -1, -1, -1, 1, -1],
          [1, 1, 0, 1, -1, 0, 1, -1, 0],
          [1, -1, -1, 0, -1, -1, 0, -1, 0],
          [1, 1, 1, 1, 0, -1, 1, -1, 1],
          [1, 1, 0, 1, 1, 0, 0, -1, 1],
          [-1, 1, -1, 0, -1, 0, 0, -1, -1],
          [1, -1, 1, 1, 1, 1, 1, 0, 1],
          [-1, 1, 0, 0, -1, -1, 1, -1, 0],
        ],
        candidates: [
          'bwLvxwn4',
          'Bi8rD2kq',
          'XuHBc1ME',
          'xhAvdxz2',
          'MBDuJLcU',
          '4lNHn78L',
          'hNtQKVPG',
          'KXxHiFYK',
          '2PWfQstO',
        ],
      }),
    ).toEqual({
      '2PWfQstO': 3,
      '4lNHn78L': 4,
      Bi8rD2kq: 1,
      KXxHiFYK: 4,
      MBDuJLcU: 4,
      XuHBc1ME: 4,
      bwLvxwn4: 4,
      hNtQKVPG: 2,
      xhAvdxz2: 4,
    })
  })
})
