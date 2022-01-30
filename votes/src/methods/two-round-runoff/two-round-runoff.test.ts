import { TwoRoundRunoff } from '.'

it('skips empty votes', () => {
  expect(
    new TwoRoundRunoff({
      candidates: ['a'],
      ballots: [{ weight: 1, ranking: [] }],
    }).ranking(),
  ).toStrictEqual([['a']])
})
