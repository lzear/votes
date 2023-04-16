import { rngGenerator } from '../../test/rng-generator'
import type { Ballot } from '../../types'
import { toWeightedBallots } from '../../utils'

import { RandomDictator } from '.'

const expectNTimes = <T>(value: T, expected: T, times: number) => {
  for (let i = 0; i < times; i++) {
    expect(value).toStrictEqual(expected)
  }
}

const vote = (ballots: Ballot[], candidates: string[], seed?: string) =>
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
  it('breaks ties', () => {
    expectNTimes(
      vote(
        toWeightedBallots([
          [['a'], ['b']],
          [['b'], ['a']],
        ]),
        ['a', 'b'],
      ).tieBreak([['b'], ['a']]),
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
      ).tieBreak([['a'], ['b']]),
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
        '222',
      ).tieBreak([['a', 'b']]),
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
      ).tieBreak([['a', 'b']]),
      [['a'], ['b']],
      5,
    )
  })
})
