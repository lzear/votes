import { fill } from 'lodash-es'
import type { Ballot } from '../types'
import { toWeightedBallots } from '../utils'

export const closeTo = (num: number, numDigits?: number) =>
  expect.closeTo(num, numDigits) as number

type ABCDE = 'a' | 'b' | 'c' | 'd' | 'e'

export const abcde = ['a', 'b', 'c', 'd', 'e'] as ABCDE[]

export const balinski = toWeightedBallots([
  ...fill(Array.from({ length: 33 }), [['a'], ['b'], ['c'], ['d'], ['e']]),
  ...fill(Array.from({ length: 16 }), [['b'], ['d'], ['c'], ['e'], ['a']]),
  ...fill(Array.from({ length: 3 }), [['c'], ['d'], ['b'], ['a'], ['e']]),
  ...fill(Array.from({ length: 8 }), [['c'], ['e'], ['b'], ['d'], ['a']]),
  ...fill(Array.from({ length: 18 }), [['d'], ['e'], ['c'], ['b'], ['a']]),
  ...fill(Array.from({ length: 22 }), [['e'], ['c'], ['b'], ['d'], ['a']]),
]) as Ballot<ABCDE>[]

export const sW = toWeightedBallots([
  ...fill(Array.from({ length: 5 }), [['a'], ['c'], ['b'], ['e'], ['d']]),
  ...fill(Array.from({ length: 5 }), [['a'], ['d'], ['e'], ['c'], ['b']]),
  ...fill(Array.from({ length: 8 }), [['b'], ['e'], ['d'], ['a'], ['c']]),
  ...fill(Array.from({ length: 3 }), [['c'], ['a'], ['b'], ['e'], ['d']]),
  ...fill(Array.from({ length: 7 }), [['c'], ['a'], ['e'], ['b'], ['d']]),
  ...fill(Array.from({ length: 2 }), [['c'], ['b'], ['a'], ['d'], ['e']]),
  ...fill(Array.from({ length: 7 }), [['d'], ['c'], ['e'], ['b'], ['a']]),
  ...fill(Array.from({ length: 8 }), [['e'], ['b'], ['a'], ['d'], ['c']]),
]) as Ballot<ABCDE>[]

export const dummyProfile = toWeightedBallots([
  [['a'], ['b'], ['c'], ['d'], ['e']],
])

export const dummyProfile10: Ballot<ABCDE>[] = toWeightedBallots(
  fill(Array.from({ length: 10 }), [['a'], ['b'], ['c'], ['d'], ['e']]),
)

export const matrixString = (matrix: number[][]): string => {
  const size = 6

  return (
    '\n' +
    matrix
      .map((r) =>
        r
          .map((c) =>
            (Math.round(c * 1000) / 1000)
              .toString()
              .padStart(size, ' ')
              .slice(0, Math.max(0, size)),
          )
          .join(' '),
      )
      .join('\n')
  )
}
