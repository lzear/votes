import { methods, SystemUsingMatrix, SystemUsingRankings, utils } from './votes'
import { VotingSystem } from './types'
import { matrixFromBallots } from './utils'
import {
  approbation,
  baldwin,
  borda,
  coombs,
  copeland,
  firstPastThePost,
  instantRunoff,
  kemeny,
  maximalLotteries,
  minimax,
  nanson,
  randomizedCondorcet,
  rankedPairs,
  schulze,
  twoRoundRunoff,
} from './votes'
import { abcde, balinski, dummyProfile, sW } from './test/testUtils'

describe('Test all methods', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })
  it('matches type', () => {
    const types: VotingSystem[] = Object.values(VotingSystem)
    types.forEach((type) => {
      expect(methods[type].type).toEqual(type)
    })
  })
  it('gets the winner from a single profile', () => {
    const m = Object.values(VotingSystem).filter(
      (k) => 'computeFromBallots' in methods[k as VotingSystem],
    ) as VotingSystem[]
    const allResults = m.reduce((acc, methodKey) => {
      const method = methods[methodKey] as SystemUsingRankings
      const score = method.computeFromBallots(dummyProfile, abcde)
      const maxScore = Math.max(...Object.values(score))
      return {
        ...acc,
        [methodKey]: Object.keys(score).filter((k) => score[k] === maxScore),
      }
    }, {})
    expect(allResults).toStrictEqual({
      APPROBATION: ['a'],
      BALDWIN: ['a'],
      BORDA: ['a'],
      COOMBS: ['a'],
      FIRST_PAST_THE_POST: ['a'],
      INSTANT_RUNOFF: ['a'],
      NANSON: ['a'],
      TWO_ROUND_RUNOFF: ['a'],
    })
    Object.values(allResults).forEach((v) => expect(v).toStrictEqual(['a']))
  })
  it('gets the matrix winner from a single profile', () => {
    const m = Object.values(VotingSystem).filter(
      (k) => 'computeFromMatrix' in methods[k as VotingSystem],
    ) as VotingSystem[]
    const allResults = m.reduce((acc, methodKey) => {
      const method = methods[methodKey] as SystemUsingMatrix
      const score = method.computeFromMatrix(
        utils.matrixFromBallots(dummyProfile, abcde),
      )
      const maxScore = Math.max(...Object.values(score))
      return {
        ...acc,
        [methodKey]: Object.keys(score).filter((k) => score[k] === maxScore),
      }
    }, {})
    expect(allResults).toStrictEqual({
      COPELAND: ['a'],
      KEMENY: ['a'],
      MAXIMAL_LOTTERIES: ['a'],
      MINIMAX: ['a'],
      RANDOMIZED_CONDORCET: ['a'],
      RANKED_PAIRS: ['a'],
      SCHULZE: ['a'],
    })
    Object.values(allResults).forEach((v) => expect(v).toStrictEqual(['a']))
  })
  it('votes with approbation', () => {
    expect(approbation.computeFromBallots(balinski, abcde)).toStrictEqual({
      a: 33,
      b: 16,
      c: 11,
      d: 18,
      e: 22,
    })
  })
  it('votes with baldwin', () => {
    expect(baldwin.computeFromBallots(balinski, abcde)).toStrictEqual({
      a: 0,
      b: 3,
      c: 4,
      d: 2,
      e: 1,
    })
  })
  it('votes with borda', () => {
    expect(borda.computeFromBallots(balinski, abcde)).toStrictEqual({
      a: 135,
      b: 247,
      c: 244,
      d: 192,
      e: 182,
    })
  })
  it('votes with coombs', () => {
    expect(coombs.computeFromBallots(balinski, abcde)).toStrictEqual({
      a: 0,
      b: 3,
      c: 4,
      d: 2,
      e: 1,
    })
  })
  it('votes with FPTP', () => {
    expect(firstPastThePost.computeFromBallots(balinski, abcde)).toStrictEqual({
      a: 33,
      b: 16,
      c: 11,
      d: 18,
      e: 22,
    })
  })
  it('votes with instant runoff', () => {
    expect(instantRunoff.computeFromBallots(balinski, abcde)).toStrictEqual({
      a: 33,
      b: 16,
      c: 11,
      d: 67,
      e: 30,
    })
  })
  it('votes with instant nanson', () => {
    expect(nanson.computeFromBallots(balinski, abcde)).toStrictEqual({
      a: 136,
      b: 243,
      c: 244,
      d: 193,
      e: 183,
    })
  })
  it('votes with two-round runoff', () => {
    expect(twoRoundRunoff.computeFromBallots(balinski, abcde)).toStrictEqual({
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
    ).toStrictEqual({
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
    ).toStrictEqual({
      a: 0,
      b: 3,
      c: 4,
      d: 2,
      e: 1,
    })
  })
  it('votes with randomizedCondorcet', () => {
    expect(
      randomizedCondorcet.computeFromMatrix(matrixFromBallots(sW, abcde)),
    ).toStrictEqual({
      a: 0.3333333333333333,
      b: 0,
      c: 0.3333333333333333,
      d: 0,
      e: 0.3333333333333333,
    })
  })
  it('votes with schulze', () => {
    expect(
      schulze.computeFromMatrix(matrixFromBallots(sW, abcde)),
    ).toStrictEqual({
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
    ).toStrictEqual({
      a: -5,
      b: -13,
      c: -11,
      d: -21,
      e: -3,
    })
  })

  it('votes with maximal lotteries', () => {
    expect(
      maximalLotteries.computeFromMatrix(matrixFromBallots(sW, abcde)),
    ).toStrictEqual({
      a: 0.6428571428571428,
      b: 0,
      c: 0,
      d: 0,
      e: 0.3571428571428572,
    })
  })
  it('votes with ranked pairs', () => {
    expect(
      rankedPairs.computeFromMatrix(matrixFromBallots(sW, abcde)),
    ).toStrictEqual({
      a: 5,
      b: 2,
      c: 4,
      d: 1,
      e: 3,
    })
  })
})
