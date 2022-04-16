import {
  Approbation,
  Baldwin,
  Borda,
  Coombs,
  Copeland,
  FirstPastThePost,
  InstantRunoff,
  Kemeny,
  MaximalLotteries,
  Minimax,
  Nanson,
  RandomizedCondorcet,
  RankedPairs,
  Schulze,
  TwoRoundRunoff,
} from '.'
import { abcde, balinski, sW } from './test/test-utils'
import { matrixFromBallots } from './utils'

describe('Test all methods', () => {
  it('votes with approbation', () => {
    expect(
      new Approbation({ candidates: abcde, ballots: balinski }).scores(),
    ).toStrictEqual({
      a: 33,
      b: 16,
      c: 11,
      d: 18,
      e: 22,
    })
  })
  it('votes with baldwin', () => {
    expect(
      new Baldwin({ ballots: balinski, candidates: abcde }).ranking(),
    ).toStrictEqual([['c'], ['b'], ['d'], ['e'], ['a']])
  })
  it('votes with borda', () => {
    expect(
      new Borda({ candidates: abcde, ballots: balinski }).scores(),
    ).toStrictEqual({
      a: 235,
      b: 347,
      c: 344,
      d: 292,
      e: 282,
    })
  })
  it('votes with coombs', () => {
    expect(
      new Coombs({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['c'], ['b'], ['d'], ['e'], ['a']])
  })
  it('votes with FPTP', () => {
    expect(
      new FirstPastThePost({ candidates: abcde, ballots: balinski }).scores(),
    ).toStrictEqual({
      a: 33,
      b: 16,
      c: 11,
      d: 18,
      e: 22,
    })
  })
  it('votes with instant runoff', () => {
    expect(
      new InstantRunoff({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['d'], ['a'], ['e'], ['b'], ['c']])
  })
  it('votes with instant nanson', () => {
    expect(
      new Nanson({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['c'], ['b'], ['a', 'd', 'e']])
  })
  it('votes with two-round runoff', () => {
    expect(
      new TwoRoundRunoff({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['e'], ['a'], ['b', 'c', 'd']])
  })
  it('votes with copeland', () => {
    expect(
      new Copeland(matrixFromBallots(balinski, abcde)).scores(),
    ).toStrictEqual({
      a: 0,
      b: 3,
      c: 4,
      d: 2,
      e: 1,
    })
  })
  it('votes with kemeny', () => {
    expect(
      new Kemeny(matrixFromBallots(balinski, abcde)).scores(),
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
      new RandomizedCondorcet(matrixFromBallots(sW, abcde)).scores(),
    ).toStrictEqual({
      a: 0.333_333_333_333_333_3,
      b: 0,
      c: 0.333_333_333_333_333_3,
      d: 0,
      e: 0.333_333_333_333_333_3,
    })
  })
  it('votes with schulze', () => {
    expect(new Schulze(matrixFromBallots(sW, abcde)).scores()).toStrictEqual({
      a: 3,
      b: 1,
      c: 2,
      d: 0,
      e: 4,
    })
  })
  it('votes with minimax', () => {
    expect(new Minimax(matrixFromBallots(sW, abcde)).scores()).toStrictEqual({
      a: -5,
      b: -13,
      c: -11,
      d: -21,
      e: -3,
    })
  })

  it('votes with maximal lotteries', () => {
    expect(
      new MaximalLotteries(matrixFromBallots(sW, abcde)).scores(),
    ).toStrictEqual({
      a: 0.642_857_142_857_142_8,
      b: 0,
      c: 0,
      d: 0,
      e: 0.357_142_857_142_857_2,
    })
  })
  it('votes with ranked pairs', () => {
    expect(
      new RankedPairs(matrixFromBallots(sW, abcde)).scores(),
    ).toStrictEqual({
      a: 5,
      b: 2,
      c: 4,
      d: 1,
      e: 3,
    })
  })
})
