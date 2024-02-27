import { fill } from 'lodash-es'

import type { Ballot } from '../types'
import { toWeightedBallots } from '../utils'

export const abcde = ['a', 'b', 'c', 'd', 'e']

export const balinski: Ballot[] = toWeightedBallots([
  ...fill(new Array(33), [['a'], ['b'], ['c'], ['d'], ['e']]),
  ...fill(new Array(16), [['b'], ['d'], ['c'], ['e'], ['a']]),
  ...fill(new Array(3), [['c'], ['d'], ['b'], ['a'], ['e']]),
  ...fill(new Array(8), [['c'], ['e'], ['b'], ['d'], ['a']]),
  ...fill(new Array(18), [['d'], ['e'], ['c'], ['b'], ['a']]),
  ...fill(new Array(22), [['e'], ['c'], ['b'], ['d'], ['a']]),
])

export const sW: Ballot[] = toWeightedBallots([
  ...fill(new Array(5), [['a'], ['c'], ['b'], ['e'], ['d']]),
  ...fill(new Array(5), [['a'], ['d'], ['e'], ['c'], ['b']]),
  ...fill(new Array(8), [['b'], ['e'], ['d'], ['a'], ['c']]),
  ...fill(new Array(3), [['c'], ['a'], ['b'], ['e'], ['d']]),
  ...fill(new Array(7), [['c'], ['a'], ['e'], ['b'], ['d']]),
  ...fill(new Array(2), [['c'], ['b'], ['a'], ['d'], ['e']]),
  ...fill(new Array(7), [['d'], ['c'], ['e'], ['b'], ['a']]),
  ...fill(new Array(8), [['e'], ['b'], ['a'], ['d'], ['c']]),
])

export const dummyProfile: Ballot[] = toWeightedBallots([
  [['a'], ['b'], ['c'], ['d'], ['e']],
])

export const dummyProfile10: Ballot[] = toWeightedBallots(
  fill(new Array(10), [['a'], ['b'], ['c'], ['d'], ['e']]),
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
