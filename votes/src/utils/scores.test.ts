import { scoresToRanking } from './scores'

it('convert scores to ranking', () => {
  expect(scoresToRanking({ a: 10, b: 5, c: 15 })).toStrictEqual([
    ['c'],
    ['a'],
    ['b'],
  ])
})

it('ties the same candidates whatever the key order', () => {
  const e = 1e-6
  expect(scoresToRanking({ a: 0, b: 0.8 * e, c: 1.6 * e })).toStrictEqual(
    scoresToRanking({ c: 1.6 * e, b: 0.8 * e, a: 0 }),
  )
})

it('ties infinite scores', () => {
  expect(scoresToRanking({ a: Infinity, b: Infinity })).toStrictEqual([
    ['a', 'b'],
  ])
})
