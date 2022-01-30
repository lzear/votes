import {
  candidatesFromBallots,
  checkDuplicatedCandidate,
  groupBallots,
  normalizeBallot,
  normalizeBallots,
  normalizeRanking,
  normalizeRankInput,
  removeDuplicatedCandidates,
  removeInvalidCandidates,
  scoresToRanking,
} from '../utils'
import { isBallotEqual } from './normalize'

describe('normalize', () => {
  it('finds if ballots are equal', () => {
    expect(isBallotEqual([], [])).toBe(true)
    expect(isBallotEqual([['a']], [['a']])).toBe(true)
    expect(isBallotEqual([['a', 'b']], [['a', 'b']])).toBe(true)
    expect(isBallotEqual([['a', 'b']], [['b', 'a']])).toBe(true)
    expect(isBallotEqual([['a'], ['b']], [['a'], ['b']])).toBe(true)
    expect(isBallotEqual([['a', 'c'], ['b']], [['c', 'a'], ['b']])).toBe(true)
  })
  it('finds if ballots are not equal', () => {
    expect(isBallotEqual([], [['a']])).toBe(false)
    expect(isBallotEqual([['a']], [])).toBe(false)
    expect(isBallotEqual([['a'], ['b']], [['a']])).toBe(false)
    expect(isBallotEqual([['a', 'b']], [['a']])).toBe(false)
    expect(isBallotEqual([['a', 'b', 'c']], [['b', 'a']])).toBe(false)
    expect(isBallotEqual([['a'], ['b']], [['a'], ['c']])).toBe(false)
    expect(isBallotEqual([['a', 'b'], ['c']], [['c', 'a'], ['b']])).toBe(false)
  })

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

  it('throw on duplicated candidates', () => {
    expect(() => checkDuplicatedCandidate([['a', 'b'], ['a']])).toThrow(
      'Some candidates are present multiple times: a',
    )
  })

  it('removes duplicated candidates', () => {
    expect(removeDuplicatedCandidates([['a', 'b'], ['a']])).toStrictEqual([
      ['a', 'b'],
    ])
  })

  it('normalizes rankinput', () => {
    expect(normalizeRankInput([['a', 'b'], 'c', 'd', ['e']])).toStrictEqual([
      ['a', 'b'],
      ['c'],
      ['d'],
      ['e'],
    ])
  })

  it('gets candidates from ballots', () => {
    expect(
      candidatesFromBallots([
        { weight: 3, ranking: [['a', 'b'], ['c']] },
        { weight: 4, ranking: [['d', 'b'], ['c']] },
        { weight: 5, ranking: [['a', 'b'], ['c']] },
      ]),
    ).toStrictEqual(['a', 'b', 'c', 'd'])
  })

  it('normalizes ballots', () => {
    expect(
      normalizeBallots([
        { weight: 3, ranking: [['a', 'b'], ['c']] },
        { weight: 4, ranking: [['d', 'b'], [], ['c']] },
        { weight: 5, ranking: [['a', 'b'], ['c']] },
      ]),
    ).toStrictEqual([
      { weight: 3, ranking: [['a', 'b'], ['c']] },
      { weight: 4, ranking: [['d', 'b'], ['c']] },
      { weight: 5, ranking: [['a', 'b'], ['c']] },
    ])
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
      { weight: 4, ranking: [['b'], ['c']] },
      { weight: 5, ranking: [['a', 'b'], ['c']] },
    ])
  })

  it('scoresToRanking', () => {
    expect(scoresToRanking({ a: 3, b: 0, c: 5 })).toEqual([['c'], ['a'], ['b']])
  })

  it('removeInvalidCandidates', () => {
    expect(removeInvalidCandidates([['a', 'b']], ['b'])).toEqual([['b']])
  })

  it('normalizeRanking', () => {
    expect(normalizeRanking([['a', 'b']], ['b'])).toEqual([['b']])
  })

  it('normalizeBallot', () => {
    expect(
      normalizeBallot({ ranking: [['a', 'b']], weight: 10 }, ['b']),
    ).toEqual({
      ranking: [['b']],
      weight: 10,
    })
  })
})
