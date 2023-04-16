import { abcde, balinski } from '../../test/test-utils'
import type { Matrix } from '../../types'
import { findSmithSet, matrixFromBallots } from '../../utils'

import { MinimaxTD } from '.'

describe(MinimaxTD, () => {
  it('scores', () => {
    const election = new MinimaxTD(matrixFromBallots(balinski, abcde))

    // c is the Condorcet winner
    expect(election.scores()).toStrictEqual({
      a: -1,
      b: -1,
      c: 2,
      d: -1,
      e: -1,
    })
  })

  it('scores with variants', () => {
    const election1 = new MinimaxTD({
      ...matrixFromBallots(balinski, abcde),
      variant: MinimaxTD.Variants.WinningVotes,
    })
    expect(election1.scores()).toStrictEqual({
      a: -1,
      b: -1,
      c: -0,
      d: -1,
      e: -1,
    })
    const election2 = new MinimaxTD({
      ...matrixFromBallots(balinski, abcde),
      variant: MinimaxTD.Variants.Margins,
    })
    expect(election2.scores()).toStrictEqual({
      a: -1,
      b: -1,
      c: 2,
      d: -1,
      e: -1,
    })
    const election3 = new MinimaxTD({
      ...matrixFromBallots(balinski, abcde),
      variant: MinimaxTD.Variants.PairwiseOpposition,
    })
    expect(election3.scores()).toStrictEqual({
      a: -99,
      b: -99,
      c: -49,
      d: -99,
      e: -99,
    })
  })

  it('ranks', () => {
    const election = new MinimaxTD(matrixFromBallots(balinski, abcde))
    expect(election.ranking()).toStrictEqual([['c'], ['a', 'b', 'd', 'e']])
  })

  it('ranks the same for all variants with Balinski', () => {
    const election1 = new MinimaxTD({
      ...matrixFromBallots(balinski, abcde),
      variant: MinimaxTD.Variants.WinningVotes,
    })
    expect(election1.ranking()).toStrictEqual([['c'], ['a', 'b', 'd', 'e']])
    const election2 = new MinimaxTD({
      ...matrixFromBallots(balinski, abcde),
      variant: MinimaxTD.Variants.Margins,
    })
    expect(election2.ranking()).toStrictEqual([['c'], ['a', 'b', 'd', 'e']])
    const election3 = new MinimaxTD({
      ...matrixFromBallots(balinski, abcde),
      variant: MinimaxTD.Variants.PairwiseOpposition,
    })
    expect(election3.ranking()).toStrictEqual([['c'], ['a', 'b', 'd', 'e']])
  })

  it('has candidates', () => {
    const election = new MinimaxTD(matrixFromBallots(balinski, abcde))
    expect(election.candidates).toStrictEqual(abcde)
  })

  it('makes matrix', () => {
    const election = new MinimaxTD(matrixFromBallots(balinski, abcde))
    expect(election.matrix).toStrictEqual({
      array: [
        [0, 33, 33, 33, 36],
        [67, 0, 49, 79, 52],
        [67, 51, 0, 66, 60],
        [67, 21, 34, 0, 70],
        [64, 48, 40, 30, 0],
      ],
      candidates: ['a', 'b', 'c', 'd', 'e'],
    })
    expect(election.matrix).toStrictEqual(election.matrix)
  })

  it('example 1', () => {
    /*
      A beat B: 58% to 42%. (16% margin)
      B beat C: 68% to 32% (36% margin)
      C beat A: 70% to 30%. (40% margin)
      A beat D: 55% to 45%. (10% margin)
      B beat D: 60% to 40%. (20% margin)
      C beat D: 99% to 1%. (98% margin)
     */

    const matrix: Matrix = {
      candidates: ['A', 'B', 'C', 'D'],
      array: [
        [0, 58, 30, 55],
        [42, 0, 68, 60],
        [70, 32, 0, 99],
        [45, 40, 1, 0],
      ],
    }
    // A, B, and C are the members of the Smith set.
    expect(findSmithSet(matrix)).toStrictEqual({
      array: [
        [0, 16, -40],
        [-16, 0, 36],
        [40, -36, 0],
      ],
      candidates: ['A', 'B', 'C'],
    })

    const minimaxTD = new MinimaxTD(matrix)
    /*
      A's 'worst pairwise defeat' is 40% margin against C (70%-30%)
      B's 'worst pairwise defeat' is 16% margin against A (58%-42%)
      C's 'worst pairwise defeat' is 36% margin against B (68%-32%)
      B has the smallest 'worst pairwise defeat', therefore B is the winner.
     */

    expect(minimaxTD.scores()).toMatchObject({
      B: -16,
      C: -36,
      A: -40,
      D: -81,
    })
  })

  it('example 2', () => {
    /*
      A tied B: 50% to 50% (0% margin)
      A beat C: 68% to 32% (36% margin)
      A beat D: 99% to 1% (98% margin)
      B beat C: 70% to 30% (40% margin)
      B beat D: 60% to 40% (20% margin)
      C beat D: 55% to 45% (10% margin)
     */

    const matrix: Matrix = {
      candidates: ['A', 'B', 'C', 'D'],
      array: [
        [0, 50, 68, 99],
        [50, 0, 70, 60],
        [32, 30, 0, 55],
        [1, 40, 45, 0],
      ],
    }
    // A and B are the members of the Smith set.
    expect(findSmithSet(matrix)).toStrictEqual({
      array: [
        [0, 0],
        [0, 0],
      ],
      candidates: ['A', 'B'],
    })

    /*
      A's 'worst pairwise victory' is -36% margin against C (32% -68%)
      B's 'worst pairwise victory' is -20% margin against C (40% -60%)
      A has the lowest "worst pairwise victory" against all the candidates, therefore A is the winner.
     */
    const minimaxTD = new MinimaxTD(matrix)
    expect(minimaxTD.scores()).toMatchObject({
      // ⚠️ the worst pairwise victory/defeat for A and B was counted from the duel A-B
      // leading to scores of 0, instead of counting the worst pairwise victories (A over C, and B over C)
      A: -0,
      B: -0,

      C: -1,
      D: -1,
    })

    const minimaxTDnoTies = new MinimaxTD({ ...matrix, excludeTies: true })
    expect(minimaxTDnoTies.scores()).toMatchObject({
      A: 36,
      B: 20,
      C: -1,
      D: -1,
    })
  })
})
