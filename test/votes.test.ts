import * as _ from 'lodash'
import descriptions from '../src/descriptions'
import methods from '../src/votes'
import borda from '../src/methods/borda'
import kemeny from '../src/methods/kemeny'
import { Ballot, Matrix, VotingSystem } from '../src/types'
import majority from '../src/methods/majority'
import runoff from '../src/methods/runoff'
import approbation from '../src/methods/approbation'
import { matrixFromBallots } from '../src/utils/makeMatrix'

/**
 * Dummy test
 */

const abcde = ['a', 'b', 'c', 'd', 'e']
const balinski: Ballot[] = [
  ..._.fill(Array(33), [['a'], ['b'], ['c'], ['d'], ['e']]),
  ..._.fill(Array(16), [['b'], ['d'], ['c'], ['e'], ['a']]),
  ..._.fill(Array(3), [['c'], ['d'], ['b'], ['a'], ['e']]),
  ..._.fill(Array(18), [['d'], ['e'], ['c'], ['b'], ['a']]),
  ..._.fill(Array(22), [['e'], ['c'], ['b'], ['d'], ['a']])
]

describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })
  it('matches type', () => {
    const types: VotingSystem[] = Object.values(VotingSystem)
    types.forEach(type => {
      expect(methods[type].type).toEqual(type)
    })
  })
  it('votes with majority', () => {
    expect(majority.computeScoresFromRankings(abcde, balinski)).toMatchObject({
      a: 33,
      b: 16,
      c: 3,
      d: 18,
      e: 22
    })
  })
  it('votes with runoff', () => {
    expect(runoff.computeScoresFromRankings(abcde, balinski)).toMatchObject({
      a: 36,
      b: 19,
      c: 3,
      d: 21,
      e: 25
    })
  })
  it('votes with borda', () => {
    expect(borda.computeScoresFromRankings(abcde, balinski)).toMatchObject({
      a: 135,
      b: 231,
      c: 212,
      d: 184,
      e: 158
    })
  })
  it('votes with approbation', () => {
    expect(approbation.computeScoresFromRankings(abcde, balinski)).toMatchObject({
      a: 33,
      b: 16,
      c: 3,
      d: 18,
      e: 22
    })
  })
  it('votes with kemeny', () => {
    expect(kemeny.computeScoresFromMatrix(matrixFromBallots(balinski, abcde))).toMatchObject({
      a: 0,
      b: 1,
      c: 2,
      d: 3,
      e: 4
    })
  })
  it('loads description', () => {
    expect(Object.keys(descriptions)).toHaveLength(Object.keys(VotingSystem).length)
  })
})
