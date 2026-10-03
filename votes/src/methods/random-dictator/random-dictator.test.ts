import { type Ballot } from '../../types'
import { rngGenerator, toWeightedBallots } from '../../utils'
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

  it('gives each candidate its chance to top the drawn ballot', () => {
    const dictator = new RandomDictator({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b']], weight: 3 },
        { ranking: [['b', 'c']], weight: 1 },
      ],
    })
    expect(dictator.probabilities()).toStrictEqual({
      a: 0.75,
      b: 0.125,
      c: 0.125,
    })
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
