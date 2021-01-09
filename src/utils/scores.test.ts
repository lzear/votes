import { scoresToRanking } from './scores'

it('convert scores to ranking', () => {
  expect(scoresToRanking({ a: 10, b: 5, c: 15 })).toStrictEqual([
    ['c'],
    ['a'],
    ['b'],
  ])
})
