import * as _ from 'lodash'
import methods from '../src/votes'
import borda from '../src/votes/methods/borda'
import kemeny from '../src/votes/methods/kemeny'
import { Bulletin, Matrix, PollType } from '../src/votes/types'
import majority from '../src/votes/methods/majority'
import runoff from '../src/votes/methods/runoff'
import approbation from '../src/votes/methods/approbation'
import { matrixFromBulletins } from '../src/votes/utils/makeMatrix'

/**
 * Dummy test
 */

const abcde = ['a', 'b', 'c', 'd', 'e']
const balinski: Bulletin[] = [
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
    const types: PollType[] = Object.values(PollType)
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
    expect(
      kemeny.computeScoresFromMatrix({
        candidateIds: abcde,
        array: matrixFromBulletins(balinski, abcde)
      })
    ).toMatchObject({
      a: 0,
      b: 1,
      c: 2,
      d: 3,
      e: 4
    })
  })
})
