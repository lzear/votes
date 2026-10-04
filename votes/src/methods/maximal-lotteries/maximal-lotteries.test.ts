import { parseCondorcetElectionFormat } from '../../formats/condorcet-election-format'
import { productVectM } from '../../test/matrix'
import { closeTo, matrixString } from '../../test/test-utils'
import { makeAntisymmetric, matrixFromBallots } from '../../utils'
import { RandomizedCondorcet } from '../randomized-condorcet'
import { MaximalLotteries } from '.'

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

describe('maximal lotteries', () => {
  it('works with "simple" example', () => {
    expect(
      new MaximalLotteries({
        array: example1,
        candidates: ['a', 'b', 'c'],
      }).probabilities(),
    ).toEqual({
      a: closeTo(2 / 7, 6),
      b: closeTo(4 / 7, 6),
      c: closeTo(1 / 7, 6),
    })
  })
  it('works with "complexer" example', () => {
    expect(
      new MaximalLotteries({ array: example2, candidates }).probabilities(),
    ).toEqual({
      a: 0,
      b: closeTo(2 / 7, 6),
      c: closeTo(4 / 7, 6),
      d: closeTo(1 / 7, 6),
      e: 0,
    })
  })
  it('works with "example3" example', () => {
    expect(
      new MaximalLotteries({
        array: example3,
        candidates: ['a', 'b', 'c', 'd', 'e'],
      }).probabilities(),
    ).toEqual({
      a: closeTo(3 / 11, 6),
      b: 0,
      c: closeTo(1 / 11, 6),
      d: 0,
      e: closeTo(7 / 11, 6),
    })
  })

  it('never draws a candidate of probability 0', () => {
    const lottery = new MaximalLotteries({
      array: [
        [0, 0, 1],
        [1, 0, 1],
        [0, 0, 0],
      ],
      candidates: ['a', 'b', 'c'],
      rng: () => 0,
    })
    expect(lottery.ranking()[0]).toStrictEqual(['b'])
  })

  it('draws no candidate of probability 0 when rng returns 1', () => {
    const lottery = new MaximalLotteries({
      candidates: ['a', 'b', 'c'],
      ballots: [{ ranking: [['a'], ['b'], ['c']] }],
      rng: () => 1,
    })
    expect(lottery.ranking()[0]).toStrictEqual(['a'])
  })

  it('picks the same lottery whatever the candidate order', () => {
    // a beats b, c ties both: any lottery between a and c is maximal.
    const ballots = [{ ranking: [['a'], ['b']] }, { ranking: [['c']] }]
    const odds = (candidates: string[]) =>
      new MaximalLotteries({ candidates, ballots }).probabilities()
    expect(odds(['c', 'b', 'a'])).toStrictEqual(odds(['a', 'b', 'c']))
  })

  it('finds unbeatable lotteries on a degenerate profile', () => {
    // Few ballots, many ties: a float simplex went wrong on it.
    const candidates = Array.from({ length: 37 }, (_, i) => `c${i}`)
    const { ballots } =
      parseCondorcetElectionFormat(`#/Candidates: ${candidates.join(';')}
c27>c33>c25>c5>c3>c30>c17=c23>c28=c20>c7=c4>c34
c35>c12=c11>c31=c30=c28
c29=c31=c4>c16=c17>c27=c3>c34=c26=c15>c11=c18>c19>c14>c24>c10=c0>c21
c3>c20=c23=c6>c13>c32>c7=c25>c11=c33=c1=c10>c18>c34=c22>c12>c31=c36>c9=c29=c28>c4=c24=c27>c8=c26>c15>c0=c5=c17>c14=c16
c31=c12>c8>c1=c34>c2>c29=c6=c5=c28>c13>c30>c4>c15=c11>c35>c16=c20=c33=c7=c23>c36>c10=c26>c14>c9=c21=c22=c19>c27>c17=c3=c25>c0>c32`)
    const { array } = makeAntisymmetric(matrixFromBallots(ballots, candidates))
    for (const [Method, payoff] of [
      [MaximalLotteries, (v: number) => v],
      [RandomizedCondorcet, Math.sign],
    ] as const) {
      const odds = new Method({ candidates, ballots }).probabilities()
      const lottery = candidates.map((c) => odds[c] ?? 0)
      const games = array.map((row) => row.map((v) => payoff(v)))
      // No candidate beats it.
      for (const v of productVectM(lottery, games))
        expect(v).toBeGreaterThanOrEqual(-1e-9)
    }
  })
})

describe('pivot', () => {
  it('matrixString', () => {
    expect(matrixString(example1)).toEqual(`
     0     -2      8
     2      0     -4
    -8      4      0`)
  })
})
