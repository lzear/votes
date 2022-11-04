import { MajorityJudgment } from '.'

describe(MajorityJudgment, () => {
  it('skips empty votes', () => {
    const a = new MajorityJudgment({
      candidates: ['a'],
      ballots: [{ weight: 1, ranking: [] }],
    })
    expect(a.ranking()).toStrictEqual([['a']])
    expect(a.judgements()).toStrictEqual({ a: [0, 0, 0, 0, 0, 0] })
    expect(a.matrix).toStrictEqual({ array: [[0]], candidates: ['a'] })
    expect(a.matrix).toStrictEqual({ array: [[0]], candidates: ['a'] })
  })
  it('handles 1 vote 1 candidate 1st rank', () => {
    const a = new MajorityJudgment({
      candidates: ['a'],
      ballots: [{ weight: 1, ranking: [['a']] }],
    })
    expect(a.ranking()).toStrictEqual([['a']])
    expect(a.judgements()).toStrictEqual({ a: [1, 0, 0, 0, 0, 0] })
  })
  it('handles 1 vote 1 candidate 2nd rank', () => {
    const a = new MajorityJudgment({
      candidates: ['a'],
      ballots: [{ weight: 1, ranking: [[], ['a']] }],
    })
    expect(a.ranking()).toStrictEqual([['a']])
    expect(a.judgements()).toStrictEqual({ a: [0, 1, 0, 0, 0, 0] })
  })
  it('handles 1 vote 1 candidate last rank', () => {
    const a = new MajorityJudgment({
      candidates: ['a'],
      ballots: [{ weight: 1, ranking: [[], [], [], [], [], ['a']] }],
    })
    expect(a.ranking()).toStrictEqual([['a']])
    expect(a.judgements()).toStrictEqual({ a: [0, 0, 0, 0, 0, 1] })
  })

  it('handles 1 vote 2 candidates 1st rank', () => {
    const a = new MajorityJudgment({
      candidates: ['a', 'b'],
      ballots: [{ weight: 1, ranking: [['a', 'b']] }],
    })
    expect(a.judgements()).toStrictEqual({
      a: [1, 0, 0, 0, 0, 0],
      b: [1, 0, 0, 0, 0, 0],
    })
    expect(a.ranking()).toStrictEqual([['a', 'b']])
  })
  it('handles 1 vote 2 candidates 2nd rank', () => {
    const a = new MajorityJudgment({
      candidates: ['a', 'b'],
      ballots: [{ weight: 1, ranking: [['a'], ['b']] }],
    })
    expect(a.ranking()).toStrictEqual([['a'], ['b']])
    expect(a.judgements()).toStrictEqual({
      a: [1, 0, 0, 0, 0, 0],
      b: [0, 1, 0, 0, 0, 0],
    })
  })
  it('handles 1 vote 2 candidates last rank', () => {
    const a = new MajorityJudgment({
      candidates: ['a', 'b'],
      ballots: [{ weight: 1, ranking: [['b'], [], [], [], [], ['a']] }],
    })
    expect(a.ranking()).toStrictEqual([['b'], ['a']])
    expect(a.judgements()).toStrictEqual({
      b: [1, 0, 0, 0, 0, 0],
      a: [0, 0, 0, 0, 0, 1],
    })
  })

  it('handles 2 votes 2 candidates', () => {
    const a = new MajorityJudgment({
      candidates: ['a', 'b'],
      ballots: [
        { weight: 1, ranking: [['b'], [], [], [], [], ['a']] },
        { weight: 1, ranking: [['a'], [], [], [], [], ['b']] },
      ],
    })
    expect(a.ranking()).toStrictEqual([['a', 'b']])
    expect(a.judgements()).toStrictEqual({
      a: [1, 0, 0, 0, 0, 1],
      b: [1, 0, 0, 0, 0, 1],
    })
  })

  it('handles more complex example 1', () => {
    const a = new MajorityJudgment({
      candidates: ['a', 'b', 'c', 'd'],
      ballots: [
        { weight: 1, ranking: [['b'], [], ['c'], ['d'], [], ['a']] },
        { weight: 1, ranking: [['a'], [], ['d'], ['c'], [], ['b']] },
      ],
    })
    expect(a.ranking()).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "c",
          "d",
        ],
      ]
    `)
    expect(a.judgements()).toMatchInlineSnapshot(`
      {
        "a": [
          1,
          0,
          0,
          0,
          0,
          1,
        ],
        "b": [
          1,
          0,
          0,
          0,
          0,
          1,
        ],
        "c": [
          0,
          0,
          1,
          1,
          0,
          0,
        ],
        "d": [
          0,
          0,
          1,
          1,
          0,
          0,
        ],
      }
    `)
  })

  it('handles more complex example 2', () => {
    const a = new MajorityJudgment({
      candidates: ['a', 'b', 'c', 'd'],
      ballots: [
        { weight: 1, ranking: [['a'], [], ['d'], ['c'], [], ['b']] },
        { weight: 1, ranking: [['b'], ['c'], [], ['d'], ['a'], []] },
      ],
    })
    expect(a.medians()).toMatchInlineSnapshot(`
      {
        "a": 2,
        "b": 2.5,
        "c": 2,
        "d": 2.5,
      }
    `)
    expect(a.ranking()).toMatchInlineSnapshot(`
      [
        [
          "a",
          "c",
        ],
        [
          "b",
          "d",
        ],
      ]
    `)
    expect(a.judgements()).toMatchInlineSnapshot(`
      {
        "a": [
          1,
          0,
          0,
          0,
          1,
          0,
        ],
        "b": [
          1,
          0,
          0,
          0,
          0,
          1,
        ],
        "c": [
          0,
          1,
          0,
          1,
          0,
          0,
        ],
        "d": [
          0,
          0,
          1,
          1,
          0,
          0,
        ],
      }
    `)
  })
})
