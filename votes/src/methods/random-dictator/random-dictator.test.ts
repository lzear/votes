import { abcde, balinski, sW } from '../../test/test-utils'
import { type Ballot } from '../../types'
import { rngGenerator, toWeightedBallots } from '../../utils'
import { Dictator } from '../dictator'
import { RandomDictator } from '.'

const expectNTimes = <T>(value: T, expected: T, times: number) => {
  for (let i = 0; i < times; i++) expect(value).toStrictEqual(expected)
}

const vote = <C extends string>(
  ballots: Ballot<C>[],
  candidates: C[],
  seed?: string,
): RandomDictator<C> =>
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

  it('draws no ballot without weight when rng returns 1', () => {
    const dictator = new RandomDictator({
      candidates: ['a', 'b'],
      ballots: [
        { ranking: [['a'], ['b']], weight: 1 },
        { ranking: [['b'], ['a']], weight: 0 },
      ],
      rng: () => 1,
    })
    expect(dictator.ranking()).toStrictEqual([['a'], ['b']])
  })

  it('ranks the candidates the picked ballot leaves out last', () => {
    expect(
      vote([{ ranking: [], weight: 1 }], ['a', 'b'], 'aaa').ranking(),
    ).toStrictEqual([['a', 'b']])
    expect(
      new RandomDictator({
        ballots: [{ ranking: [['a']], weight: 1 }],
        candidates: ['a', 'b', 'c'],
        unrankedLast: false,
      }).ranking(),
    ).toStrictEqual([['a'], ['b', 'c']])
  })

  it('gives each candidate its chance to win, ties broken by later draws', () => {
    // The b–c ballot's tie goes to the a > b > c ballot.
    const dictator = new RandomDictator({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b']], weight: 3 },
        { ranking: [['b', 'c']], weight: 1 },
      ],
    })
    expect(dictator.probabilities()).toStrictEqual({ a: 0.75, b: 0.25, c: 0 })
  })

  it('splits a tie between parts by the weight of the ballots making them', () => {
    const dictator = new RandomDictator({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a', 'b'], ['c']], weight: 2 },
        { ranking: [['c'], ['a']], weight: 1 },
        { ranking: [['b'], ['a']], weight: 1 },
      ],
    })
    // a and b first (1/2) then b over a (1/2), or b (1/4), or c then a (1/4).
    expect(dictator.probabilities()).toStrictEqual({
      a: 0.25,
      b: 0.5,
      c: 0.25,
    })
  })

  it("breaks the drawn ballot's ties with the next drawn", () => {
    const ballots = [
      { ranking: [['a', 'b'], ['c']] },
      { ranking: [['c'], ['b'], ['a']] },
    ]
    for (const seed of ['aaa', 'bbb', 'ccc'])
      expect(vote(ballots, ['a', 'b', 'c'], seed).ranking()).toHaveLength(3)
  })

  it('ranks as Dictator when rng returns 0', () => {
    const input = { candidates: abcde, ballots: [...sW, ...balinski] }
    expect(
      new RandomDictator({ ...input, rng: () => 0 }).ranking(),
    ).toStrictEqual(new Dictator(input).ranking())
  })

  it('passes on blank ballots, with countBlank too', () => {
    const input = {
      candidates: ['a', 'b'],
      ballots: [
        { ranking: [['a']], weight: 1 },
        { ranking: [], weight: 1 },
      ],
    }
    for (const countBlank of [false, true]) {
      const dictator = new RandomDictator({ ...input, countBlank })
      expect(dictator.probabilities()).toStrictEqual({ a: 1, b: 0 })
      expect(dictator.ranking()).toStrictEqual([['a'], ['b']])
    }
  })

  it('ties everyone without weight to draw from', () => {
    const dictator = new RandomDictator({
      candidates: ['a', 'b'],
      ballots: [{ ranking: [['a']], weight: 0 }],
    })
    expect(dictator.ranking()).toStrictEqual([['a', 'b']])
    expect(dictator.probabilities()).toStrictEqual({ a: 0.5, b: 0.5 })
  })

  it('keeps its rng on restrict', () => {
    const rng = rngGenerator('restrict')
    expect(
      new RandomDictator({ ballots: [], candidates: ['a', 'b'], rng }).restrict(
        ['a'],
      ),
    ).toMatchObject({ rng })
  })
})
