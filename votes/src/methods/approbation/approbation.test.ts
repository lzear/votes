import { Approbation } from '.'

it('skips empty votes', () => {
  const a = new Approbation({
    candidates: ['a'],
    ballots: [{ weight: 1, ranking: [] }],
  })
  expect(a.ranking()).toStrictEqual([['a']])
  expect(a.scores()).toStrictEqual({ a: 0 })
})
