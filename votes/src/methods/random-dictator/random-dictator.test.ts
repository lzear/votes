import { abcde, balinski, sW } from '../../test/test-utils'
import type { Ballot } from '../../types'
import { rngGenerator, toWeightedBallots } from '../../utils'
import { sum } from '../../utils/sum'
import { Dictator } from '../dictator'
import { RandomDictator } from '.'

const expectNTimes = <T>(value: T, expected: T) => {
  for (let i = 0; i < 5; i++) expect(value).toStrictEqual(expected)
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

// The odds from every draw order, each ballot drawn by weight among those left.
const everyOrder = (candidates: string[], ballots: Ballot<string>[]) => {
  const odds = Object.fromEntries(candidates.map((c) => [c, 0]))
  const draw = (left: Ballot<string>[], p: number, drawn: typeof left) => {
    const total = sum(left.map((b) => b.weight ?? 1))
    if (total === 0) {
      const [top = []] = new Dictator({
        candidates,
        ballots: drawn,
      }).ranking()
      for (const c of top) odds[c] = (odds[c] ?? 0) + p / top.length
    } else
      for (const [i, b] of left.entries())
        if ((b.weight ?? 1) > 0)
          draw(left.toSpliced(i, 1), (p * (b.weight ?? 1)) / total, [
            ...drawn,
            b,
          ])
  }
  draw(ballots, 1, [])
  return odds
}

const names = (n: number) =>
  Array.from({ length: n }, (_, i) => `c${String(i)}`)

describe(RandomDictator, () => {
  it('is deterministic', () => {
    expectNTimes(vote([], ['a', 'b'], 'aaa').ranking(), [['a', 'b']])
    expectNTimes(vote([], ['a', 'b'], 'bbb').ranking(), [['a', 'b']])
    expectNTimes(vote([], ['a', 'b'], 'ccc').ranking(), [['a', 'b']])

    expectNTimes(
      vote(toWeightedBallots([[['a'], ['b']]]), ['a', 'b'], 'aaa').ranking(),
      [['a'], ['b']],
    )
    expectNTimes(
      vote(toWeightedBallots([[['a'], ['b']]]), ['a', 'b'], 'bbb').ranking(),
      [['a'], ['b']],
    )
    expectNTimes(
      vote(toWeightedBallots([[['a'], ['b']]]), ['a', 'b'], 'ccc').ranking(),
      [['a'], ['b']],
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

  describe('maxReads', () => {
    const rng = rngGenerator('ties')
    const shuffled = (candidates: string[]) =>
      candidates
        .map((c) => ({ c, r: rng() }))
        .toSorted((x, y) => x.r - y.r)
        .map(({ c }) => c)
    // Each ballot ranks a random half of the candidates first, the rest tied.
    const twoTier = (candidates: string[], length: number) =>
      Array.from({ length }, () => {
        const top = candidates.filter(() => rng() < 0.5)
        return { ranking: [top.length > 0 ? top : candidates], weight: 1 }
      })

    it('throws past it on tied ballots', () => {
      const candidates = names(16)
      const ballots = Array.from({ length: 200 }, () => {
        const order = shuffled(candidates)
        return { ranking: [order.slice(0, 8), order.slice(8)], weight: 1 }
      })
      expect(() =>
        new RandomDictator({ candidates, ballots, maxReads: 1000 })
          .restrict(candidates.slice(0, 8))
          .probabilities(),
      ).toThrow(/maxReads/)
      const odds = new RandomDictator({ candidates, ballots }).probabilities()
      expect(sum(Object.values(odds))).toBeCloseTo(1)
    })

    it('ends within about a second on many tied ballots', () => {
      const candidates = names(16)
      const dictator = new RandomDictator({
        candidates,
        ballots: twoTier(candidates, 20_000),
      })
      const start = performance.now()
      expect(() => dictator.probabilities()).toThrow(RangeError)
      expect(performance.now() - start).toBeLessThan(2000)
    })

    it('reads identical ballots as one, exactly', () => {
      const candidates = names(5)
      for (let n = 0; n < 20; n++) {
        const ballots = twoTier(candidates, 3)
        ballots.push(
          { ...ballots[0]!, weight: 2 },
          { ...ballots[1]!, weight: 0 },
          ...twoTier(candidates, 1),
        )
        const odds = new RandomDictator({ candidates, ballots }).probabilities()
        const expected = everyOrder(candidates, ballots)
        for (const c of candidates) expect(odds[c]).toBeCloseTo(expected[c]!)
      }
    })

    it('never reaches it on strict ballots', () => {
      const candidates = names(30)
      const ballots = Array.from({ length: 200 }, () => ({
        ranking: shuffled(candidates).map((c) => [c]),
        weight: 1,
      }))
      const odds = new RandomDictator({
        candidates,
        ballots,
        maxReads: 0,
      }).probabilities()
      expect(sum(Object.values(odds))).toBeCloseTo(1)
    })
  })
})
