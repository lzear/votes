import { Approval } from '.'

it('skips empty votes', () => {
  const a = new Approval({
    candidates: ['a'],
    ballots: [{ weight: 1, ranking: [] }],
  })
  expect(a.ranking()).toStrictEqual([['a']])
  expect(a.scores()).toStrictEqual({ a: 0 })
})
