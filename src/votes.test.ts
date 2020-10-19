import * as _ from 'lodash'
import descriptions from './descriptions'
import { methods } from './votes'
import { VotingSystem, Ballot } from './types'
import { matrixFromBallots, toWeightedBallots } from './utils'
import approbation from './methods/approbation'
import borda from './methods/borda'
import copeland from './methods/copeland'
import firstPastThePost from './methods/first-past-the-post'
import instantRunoff from './methods/instant-runoff'
import kemeny from './methods/kemeny'
import minimax from './methods/minimax'
import schulze from './methods/schulze'
import twoRountRunoff from './methods/two-round-runoff'

const abcde = ['a', 'b', 'c', 'd', 'e']

const balinski: Ballot[] = toWeightedBallots([
  ..._.fill(Array(33), [['a'], ['b'], ['c'], ['d'], ['e']]),
  ..._.fill(Array(16), [['b'], ['d'], ['c'], ['e'], ['a']]),
  ..._.fill(Array(3), [['c'], ['d'], ['b'], ['a'], ['e']]),
  ..._.fill(Array(8), [['c'], ['e'], ['b'], ['d'], ['a']]),
  ..._.fill(Array(18), [['d'], ['e'], ['c'], ['b'], ['a']]),
  ..._.fill(Array(22), [['e'], ['c'], ['b'], ['d'], ['a']]),
])

const sW: Ballot[] = toWeightedBallots([
  ..._.fill(Array(5), [['a'], ['c'], ['b'], ['e'], ['e']]),
  ..._.fill(Array(5), [['a'], ['d'], ['e'], ['c'], ['b']]),
  ..._.fill(Array(8), [['b'], ['e'], ['d'], ['a'], ['c']]),
  ..._.fill(Array(3), [['c'], ['a'], ['b'], ['e'], ['d']]),
  ..._.fill(Array(7), [['c'], ['a'], ['e'], ['b'], ['d']]),
  ..._.fill(Array(2), [['c'], ['b'], ['a'], ['d'], ['e']]),
  ..._.fill(Array(7), [['d'], ['c'], ['e'], ['b'], ['a']]),
  ..._.fill(Array(8), [['e'], ['b'], ['a'], ['d'], ['c']]),
])

describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })
  it('matches type', () => {
    const types: VotingSystem[] = Object.values(VotingSystem)
    types.forEach((type) => {
      expect(methods[type].type).toEqual(type)
    })
  })
  it('votes with approbation', () => {
    expect(approbation.computeFromBallots(balinski, abcde)).toMatchObject({
      a: 33,
      b: 16,
      c: 11,
      d: 18,
      e: 22,
    })
  })
  it('votes with borda', () => {
    expect(borda.computeFromBallots(balinski, abcde)).toMatchObject({
      a: 135,
      b: 247,
      c: 244,
      d: 192,
      e: 182,
    })
  })
  it('votes with FPTP', () => {
    expect(firstPastThePost.computeFromBallots(balinski, abcde)).toMatchObject({
      a: 33,
      b: 16,
      c: 11,
      d: 18,
      e: 22,
    })
  })
  it('votes with instant runoff', () => {
    expect(instantRunoff.computeFromBallots(balinski, abcde)).toMatchObject({
      a: 33,
      b: 16,
      c: 11,
      d: 67,
      e: 30,
    })
  })
  it('votes with two-round runoff', () => {
    expect(twoRountRunoff.computeFromBallots(balinski, abcde)).toMatchObject({
      a: 36,
      b: 16,
      c: 11,
      d: 18,
      e: 64,
    })
  })
  it('votes with copeland', () => {
    expect(
      copeland.computeFromMatrix(matrixFromBallots(balinski, abcde)),
    ).toMatchObject({
      a: -4,
      b: 1.76,
      c: 3.84,
      d: -0.24,
      e: -2.16,
    })
  })
  it('votes with kemeny', () => {
    expect(
      kemeny.computeFromMatrix(matrixFromBallots(balinski, abcde)),
    ).toMatchObject({
      a: 0,
      b: 3,
      c: 4,
      d: 2,
      e: 1,
    })
  })
  it('votes with schulze', () => {
    expect(
      schulze.computeFromMatrix(matrixFromBallots(sW, abcde)),
    ).toMatchObject({
      a: 3,
      b: 1,
      c: 2,
      d: 0,
      e: 4,
    })
  })
  it('votes with minimax', () => {
    expect(
      minimax.computeFromMatrix(matrixFromBallots(sW, abcde)),
    ).toMatchObject({
      a: -5,
      b: -13,
      c: -11,
      d: -22,
      e: -3,
    })
  })
  it('loads description', () => {
    expect(Object.keys(descriptions)).toHaveLength(
      Object.keys(VotingSystem).length,
    )
  })
})
