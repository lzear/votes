import {
  groupBallots,
  normalizeBallots,
  removeDuplicatedCandidates,
  removeInvalidCandidates,
  scoresToRanking,
} from '../utils'

describe('normalize', () => {
  it('groups ballots', () => {
    expect(
      groupBallots([
        { weight: 3, ranking: [['a', 'b'], ['c']] },
        { weight: 4, ranking: [['d', 'b'], ['c']] },
        { weight: 5, ranking: [['a', 'b'], ['c']] },
      ]),
    ).toStrictEqual([
      { weight: 8, ranking: [['a', 'b'], ['c']] },
      { weight: 4, ranking: [['d', 'b'], ['c']] },
    ])
  })

  it('keeps apart ballots that differ by an empty tier', () => {
    expect(
      groupBallots([
        { weight: 1, ranking: [['a'], [], ['b']] },
        { weight: 2, ranking: [['a'], ['b']] },
      ]),
    ).toStrictEqual([
      { weight: 2, ranking: [['a'], ['b']] },
      { weight: 1, ranking: [['a'], [], ['b']] },
    ])
  })

  it('removes duplicated candidates', () => {
    expect(removeDuplicatedCandidates([['a', 'b'], ['a']])).toStrictEqual([
      ['a', 'b'],
    ])
  })

  it('normalizes ballots', () => {
    // d stripped from ballot2, a appended as unranked
    expect(
      normalizeBallots(
        [
          { weight: 3, ranking: [['a', 'b'], ['c']] },
          { weight: 4, ranking: [['d', 'b'], ['c']] },
          { weight: 5, ranking: [['a', 'b'], ['c']] },
        ],
        ['a', 'b', 'c'] as string[],
      ),
    ).toStrictEqual([
      { weight: 3, ranking: [['a', 'b'], ['c']] },
      { weight: 4, ranking: [['b'], ['c'], ['a']] },
      { weight: 5, ranking: [['a', 'b'], ['c']] },
    ])
  })

  it('scoresToRanking', () => {
    expect(scoresToRanking({ a: 3, b: 0, c: 5 })).toEqual([['c'], ['a'], ['b']])
  })

  it('removeInvalidCandidates', () => {
    expect(removeInvalidCandidates([['a', 'b']], ['b'])).toEqual([['b']])
  })
})
