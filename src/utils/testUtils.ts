import * as _ from 'lodash'
import { Ballot } from '../types'
import { toWeightedBallots } from './normalize'

export const abcde = ['a', 'b', 'c', 'd', 'e']

export const balinski: Ballot[] = toWeightedBallots([
  ..._.fill(Array(33), [['a'], ['b'], ['c'], ['d'], ['e']]),
  ..._.fill(Array(16), [['b'], ['d'], ['c'], ['e'], ['a']]),
  ..._.fill(Array(3), [['c'], ['d'], ['b'], ['a'], ['e']]),
  ..._.fill(Array(8), [['c'], ['e'], ['b'], ['d'], ['a']]),
  ..._.fill(Array(18), [['d'], ['e'], ['c'], ['b'], ['a']]),
  ..._.fill(Array(22), [['e'], ['c'], ['b'], ['d'], ['a']]),
])

export const sW: Ballot[] = toWeightedBallots([
  ..._.fill(Array(5), [['a'], ['c'], ['b'], ['e'], ['e']]),
  ..._.fill(Array(5), [['a'], ['d'], ['e'], ['c'], ['b']]),
  ..._.fill(Array(8), [['b'], ['e'], ['d'], ['a'], ['c']]),
  ..._.fill(Array(3), [['c'], ['a'], ['b'], ['e'], ['d']]),
  ..._.fill(Array(7), [['c'], ['a'], ['e'], ['b'], ['d']]),
  ..._.fill(Array(2), [['c'], ['b'], ['a'], ['d'], ['e']]),
  ..._.fill(Array(7), [['d'], ['c'], ['e'], ['b'], ['a']]),
  ..._.fill(Array(8), [['e'], ['b'], ['a'], ['d'], ['c']]),
])

export const dummyProfile: Ballot[] = toWeightedBallots([
  [['a'], ['b'], ['c'], ['d'], ['e']],
])

export const dummyProfile10: Ballot[] = toWeightedBallots(
  _.fill(Array(10), [['a'], ['b'], ['c'], ['d'], ['e']]),
)
