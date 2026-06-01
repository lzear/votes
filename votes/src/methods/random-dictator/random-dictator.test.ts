import type { Ballot } from '../../types'
import { rngGenerator, toWeightedBallots } from '../../utils'
import { RandomDictator } from '.'

const expectNTimes = <T>(value: T, expected: T, times: number) => {
  for (let i = 0; i < times; i++) expect(value).toStrictEqual(expected)
}

const vote = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  seed?: string,
) =>
  new RandomDictator({
    ballots,
    candidates,
    rng: seed ? rngGenerator(seed) : undefined,
  })

describe(RandomDictator, () => {
  it('is deterministic', () => {
    expectNTimes(vote([], ['a', 'b'], 'aaa').ranking(), [['a', 'b']], 5)
    expectNTimes(vote([], ['a', 'b'], 'bbb').ranking(), [['a', 'b']], 5)
    expectNTimes(vote([], ['a', 'b'], 'ccc').ranking(), [['a', 'b']], 5)

    expectNTimes(
      vote(toWeightedBallots([[['a'], ['b']]]), ['a', 'b'], 'aaa').ranking(),
      [['a'], ['b']],
      5,
    )
    expectNTimes(
      vote(toWeightedBallots([[['a'], ['b']]]), ['a', 'b'], 'bbb').ranking(),
      [['a'], ['b']],
      5,
    )
    expectNTimes(
      vote(toWeightedBallots([[['a'], ['b']]]), ['a', 'b'], 'ccc').ranking(),
      [['a'], ['b']],
      5,
    )
  })

  it('takes random ballot from 2 ballots', () => {
    expectNTimes(
      vote(
        toWeightedBallots([
          [['a'], ['b']],
          [['b'], ['a']],
        ]),
        ['a', 'b'],
        '111',
      ).ranking(),
      [['b'], ['a']],
      5,
    )
    expectNTimes(
      vote(
        toWeightedBallots([
          [['a'], ['b']],
          [['b'], ['a']],
        ]),
        ['a', 'b'],
        '222',
      ).ranking(),
      [['a'], ['b']],
      5,
    )
    expectNTimes(
      vote(
        toWeightedBallots([
          [['a'], ['b']],
          [['b'], ['a']],
        ]),
        ['a', 'b'],
        '333',
      ).ranking(),
      [['a'], ['b']],
      5,
    )
  })
  it('picks first ballot when rng returns 0', () => {
    const ballots = toWeightedBallots([
      [['a'], ['b']],
      [['b'], ['a']],
    ])
    const result = new RandomDictator({
      ballots,
      candidates: ['a', 'b'],
      rng: () => 0,
    }).ranking()
    expect(result).toStrictEqual([['a'], ['b']])
  })

  it('picks last ballot when rng returns 1', () => {
    const ballots = toWeightedBallots([
      [['a'], ['b']],
      [['b'], ['a']],
    ])
    const result = new RandomDictator({
      ballots,
      candidates: ['a', 'b'],
      rng: () => 1,
    }).ranking()
    expect(result).toStrictEqual([['b'], ['a']])
  })
})
