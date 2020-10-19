import {
  candidatesFromBallots,
  checkDuplicatedCandidate,
  groupBallots,
  normalizeBallots,
  normalizeRankinput,
  removeDuplicatedCandidates,
} from './normalize'

it('groups ballots', () => {
  expect(
    groupBallots([
      { weight: 3, ranking: [['a', 'b'], ['c']] },
      { weight: 4, ranking: [['d', 'b'], ['c']] },
      { weight: 5, ranking: [['a', 'b'], ['c']] },
    ]),
  ).toMatchObject([
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
  expect(removeDuplicatedCandidates([['a', 'b'], ['a']])).toMatchObject([
    ['a', 'b'],
  ])
})

it('normalizes rankinput', () => {
  expect(normalizeRankinput([['a', 'b'], 'c', 'd', ['e']])).toMatchObject([
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
  ).toMatchObject(['a', 'b', 'c', 'd'])
})

it('normalizes ballots', () => {
  expect(
    normalizeBallots([
      { weight: 3, ranking: [['a', 'b'], ['c']] },
      { weight: 4, ranking: [['d', 'b'], [], ['c']] },
      { weight: 5, ranking: [['a', 'b'], ['c']] },
    ]),
  ).toMatchObject([
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
      ['a', 'b', 'c'],
    ),
  ).toMatchObject([
    { weight: 3, ranking: [['a', 'b'], ['c']] },
    { weight: 4, ranking: [['b'], ['c']] },
    { weight: 5, ranking: [['a', 'b'], ['c']] },
  ])
})
