import { rngGenerator } from '../../test/rng-generator'
import { RandomCandidates } from '.'

const vote = (candidates: string[], seed?: string) =>
  new RandomCandidates({
    candidates,
    rng: seed ? rngGenerator(seed) : undefined,
  }).ranking()

describe(RandomCandidates, () => {
  it('takes the candidate', () => {
    expect(
      new RandomCandidates({
        candidates: ['a'],
      }).ranking(),
    ).toStrictEqual([['a']])
  })

  it('works with seed', () => {
    expect(vote(['a'], 'aaa')).toStrictEqual([['a']])
    expect(vote(['a'], 'bbb')).toStrictEqual([['a']])
    expect(vote(['a'], 'ccc')).toStrictEqual([['a']])
    expect(vote(['a'], 'ddd')).toStrictEqual([['a']])
  })
  it('works without seed', () => {
    expect(vote(['a'])).toStrictEqual([['a']])
  })
  it('is deterministic', () => {
    expect(vote(['a', 'b'], 'aaa')).toStrictEqual([['b'], ['a']])
    expect(vote(['a', 'b'], 'aaa')).toStrictEqual([['b'], ['a']])

    expect(vote(['a', 'b'], 'bbb')).toStrictEqual([['b'], ['a']])
    expect(vote(['a', 'b'], 'bbb')).toStrictEqual([['b'], ['a']])

    expect(vote(['a', 'b'], 'ccc')).toStrictEqual([['b'], ['a']])
    expect(vote(['a', 'b'], 'ccc')).toStrictEqual([['b'], ['a']])

    expect(vote(['a', 'b'], 'ddd')).toStrictEqual([['a'], ['b']])
    expect(vote(['a', 'b'], 'ddd')).toStrictEqual([['a'], ['b']])
  })

  it('takes an rng that returns 1', () => {
    expect(
      new RandomCandidates({ candidates: ['a', 'b'], rng: () => 1 }).ranking(),
    ).toStrictEqual([['a'], ['b']])
  })

  it('gives every candidate the same odds', () => {
    expect(
      new RandomCandidates({
        candidates: ['a', 'b', 'c', 'd'],
      }).probabilities(),
    ).toStrictEqual({ a: 0.25, b: 0.25, c: 0.25, d: 0.25 })
  })
})
