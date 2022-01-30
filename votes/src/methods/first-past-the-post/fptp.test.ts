import { firstPastThePost } from '.'

it('skips empty votes', () => {
  expect(
    firstPastThePost.computeFromBallots([{ weight: 1, ranking: [] }], ['a']),
  ).toStrictEqual({ a: 0 })
})
