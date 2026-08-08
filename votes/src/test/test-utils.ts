import { type Ballot } from '../types'
import { toWeightedBallots } from '../utils'

export const closeTo = (num: number, numDigits?: number) =>
  expect.closeTo(num, numDigits) as number

type ABCDE = 'a' | 'b' | 'c' | 'd' | 'e'

export const abcde = ['a', 'b', 'c', 'd', 'e'] as ABCDE[]

const repeat = <T>(length: number, value: T): T[] =>
  Array.from({ length }, () => value)

export const balinski = toWeightedBallots([
  ...repeat(33, [['a'], ['b'], ['c'], ['d'], ['e']]),
  ...repeat(16, [['b'], ['d'], ['c'], ['e'], ['a']]),
  ...repeat(3, [['c'], ['d'], ['b'], ['a'], ['e']]),
  ...repeat(8, [['c'], ['e'], ['b'], ['d'], ['a']]),
  ...repeat(18, [['d'], ['e'], ['c'], ['b'], ['a']]),
  ...repeat(22, [['e'], ['c'], ['b'], ['d'], ['a']]),
]) as Ballot<ABCDE>[]

export const sW = toWeightedBallots([
  ...repeat(5, [['a'], ['c'], ['b'], ['e'], ['d']]),
  ...repeat(5, [['a'], ['d'], ['e'], ['c'], ['b']]),
  ...repeat(8, [['b'], ['e'], ['d'], ['a'], ['c']]),
  ...repeat(3, [['c'], ['a'], ['b'], ['e'], ['d']]),
  ...repeat(7, [['c'], ['a'], ['e'], ['b'], ['d']]),
  ...repeat(2, [['c'], ['b'], ['a'], ['d'], ['e']]),
  ...repeat(7, [['d'], ['c'], ['e'], ['b'], ['a']]),
  ...repeat(8, [['e'], ['b'], ['a'], ['d'], ['c']]),
]) as Ballot<ABCDE>[]

export const dummyProfile = toWeightedBallots([
  [['a'], ['b'], ['c'], ['d'], ['e']],
])

export const dummyProfile10: Ballot<ABCDE>[] = toWeightedBallots(
  repeat(10, [['a'], ['b'], ['c'], ['d'], ['e']]),
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
