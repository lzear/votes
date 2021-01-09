import { approbation } from '.'

it('skips empty votes', () => {
  expect(
    approbation.computeFromBallots([{ weight: 1, ranking: [] }], ['a']),
  ).toStrictEqual({ a: 0 })
})
