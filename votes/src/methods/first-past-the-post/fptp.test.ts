import { FirstPastThePost } from '.'

it('skips empty votes', () => {
  expect(
    new FirstPastThePost({
      candidates: ['a'],
      ballots: [{ weight: 1, ranking: [] }],
    }).scores(),
  ).toStrictEqual({
    a: 0,
  })
})
