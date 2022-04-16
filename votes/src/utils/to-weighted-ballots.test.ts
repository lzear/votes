import { toWeightedBallots } from './normalize'

describe(toWeightedBallots, () => {
  it('works with no ballots', () => {
    expect(toWeightedBallots([])).toStrictEqual([])
  })

  it('works with empty ballots', () => {
    expect(toWeightedBallots([[]])).toStrictEqual([{ ranking: [], weight: 1 }])
    expect(toWeightedBallots([[], []])).toStrictEqual([
      { ranking: [], weight: 2 },
    ])
  })

  it('gathers ballots', () => {
    expect(
      toWeightedBallots([
        [['a'], ['b'], ['c']],
        [['a'], ['b'], ['c']],
      ]),
    ).toStrictEqual([{ ranking: [['a'], ['b'], ['c']], weight: 2 }])
    expect(
      toWeightedBallots([
        [['a'], ['b'], ['c']],
        [['a'], ['b'], ['c']],
        [['b'], ['c'], ['a']],
      ]),
    ).toStrictEqual([
      { ranking: [['a'], ['b'], ['c']], weight: 2 },
      { ranking: [['b'], ['c'], ['a']], weight: 1 },
    ])
  })
  it('ignores order inside rank', () => {
    expect(
      toWeightedBallots([
        [['a', 'b'], ['c']],
        [['b', 'a'], ['c']],
      ]),
    ).toStrictEqual([{ ranking: [['a', 'b'], ['c']], weight: 2 }])
  })
})
