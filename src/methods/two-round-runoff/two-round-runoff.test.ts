import { twoRoundRunoff } from '.'

it('skips empty votes', () => {
  expect(
    twoRoundRunoff.computeFromBallots([{ weight: 1, ranking: [] }], ['a']),
  ).toStrictEqual({ a: 0 })
})
