import { abcde, balinski } from '../../test/test-utils'
import { matrixFromBallots } from '../../utils'
import { MinimaxTD } from '../minimax-td'
import { Minimax, MinimaxVariant } from '.'

describe(Minimax, () => {
  it('scores', () => {
    const election = new Minimax(matrixFromBallots(balinski, abcde))
    expect(election.scores()).toStrictEqual({
      a: -34,
      b: -2,
      c: 2,
      d: -58,
      e: -40,
    })
  })

  it('scores with variants', () => {
    const election1 = new Minimax({
      ...matrixFromBallots(balinski, abcde),
      variant: Minimax.Variants.WinningVotes,
    })
    expect(election1.scores()).toStrictEqual({
      a: -67,
      b: -51,
      c: -0,
      d: -79,
      e: -70,
    })
    const election2 = new Minimax({
      ...matrixFromBallots(balinski, abcde),
      variant: Minimax.Variants.Margins,
    })
    expect(election2.scores()).toStrictEqual({
      a: -34,
      b: -2,
      c: 2,
      d: -58,
      e: -40,
    })
    const election3 = new Minimax({
      ...matrixFromBallots(balinski, abcde),
      variant: Minimax.Variants.PairwiseOpposition,
    })
    expect(election3.scores()).toStrictEqual({
      a: -67,
      b: -51,
      c: -49,
      d: -79,
      e: -70,
    })
  })

  it('ranks', () => {
    const election = new Minimax(matrixFromBallots(balinski, abcde))
    expect(election.ranking()).toStrictEqual([
      ['c'],
      ['b'],
      ['a'],
      ['e'],
      ['d'],
    ])
  })

  it('ranks the same for all variants with Balinski', () => {
    const election1 = new Minimax({
      ...matrixFromBallots(balinski, abcde),
      variant: Minimax.Variants.WinningVotes,
    })
    expect(election1.ranking()).toStrictEqual([
      ['c'],
      ['b'],
      ['a'],
      ['e'],
      ['d'],
    ])
    const election2 = new Minimax({
      ...matrixFromBallots(balinski, abcde),
      variant: Minimax.Variants.Margins,
    })
    expect(election2.ranking()).toStrictEqual([
      ['c'],
      ['b'],
      ['a'],
      ['e'],
      ['d'],
    ])
    const election3 = new Minimax({
      ...matrixFromBallots(balinski, abcde),
      variant: Minimax.Variants.PairwiseOpposition,
    })
    expect(election3.ranking()).toStrictEqual([
      ['c'],
      ['b'],
      ['a'],
      ['e'],
      ['d'],
    ])
  })

  it('has candidates', () => {
    const election = new Minimax(matrixFromBallots(balinski, abcde))
    expect(election.candidates).toStrictEqual(abcde)
  })

  it('makes matrix', () => {
    const election = new Minimax(matrixFromBallots(balinski, abcde))
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

  it('ties candidates with only excluded ties', () => {
    const matrix = {
      candidates: ['a', 'b'],
      array: [
        [0, 1],
        [1, 0],
      ],
    }
    expect(
      new Minimax({ ...matrix, excludeTies: true }).ranking(),
    ).toStrictEqual([['a', 'b']])
  })

  it('keeps its options on restrict', () => {
    for (const Ctor of [Minimax, MinimaxTD]) {
      const restricted = new Ctor({
        ...matrixFromBallots(balinski, abcde),
        variant: MinimaxVariant.WinningVotes,
        excludeTies: true,
      }).restrict(['a', 'b', 'c'])
      expect(restricted).toBeInstanceOf(Ctor)
      expect(restricted).toMatchObject({
        minimaxVariant: MinimaxVariant.WinningVotes,
        excludeTies: true,
      })
    }
  })
})
