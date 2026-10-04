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
          "c",
          "d",
        ],
        [
          "a",
          "b",
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
        "a": 4,
        "b": 5,
        "c": 3,
        "d": 3,
      }
    `)
    expect(a.ranking()).toMatchInlineSnapshot(`
      [
        [
          "c",
        ],
        [
          "d",
        ],
        [
          "a",
        ],
        [
          "b",
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

  it('breaks ties by majority value', () => {
    // Grades a: 3 4 5 0 3, b: 0 5 1 3 5, c: 0 4 3 4 2. All three have majority
    // grade 3. One 3 taken away: b drops to 5, a and c to 4. One 4 taken away:
    // c comes back to 2, a only to 3.
    const grades = {
      a: [3, 4, 5, 0, 3],
      b: [0, 5, 1, 3, 5],
      c: [0, 4, 3, 4, 2],
    }
    const ballots = [0, 1, 2, 3, 4].map((voter) => {
      const ranking: string[][] = [[], [], [], [], [], []]
      for (const [c, g] of Object.entries(grades)) ranking[g[voter]!]!.push(c)
      return { ranking, weight: 1 }
    })
    expect(
      new MajorityJudgment({ candidates: ['a', 'b', 'c'], ballots }).ranking(),
    ).toStrictEqual([['c'], ['a'], ['b']])
  })

  it('grades a candidate once per ballot', () => {
    const mj = new MajorityJudgment({
      candidates: ['a', 'b'],
      ballots: [{ ranking: [['a'], ['a', 'b']], weight: 1 }],
    })
    expect(mj.judgements()).toStrictEqual({
      a: [1, 0, 0, 0, 0, 0],
      b: [0, 1, 0, 0, 0, 0],
    })
  })

  it('takes any number of grades', () => {
    const mj = new MajorityJudgment({
      candidates: ['a', 'b'],
      ballots: [{ ranking: [[], [], [], [], [], ['a'], [], ['b']], weight: 1 }],
      grades: 8,
    })
    expect(mj.judgements()).toStrictEqual({
      a: [0, 0, 0, 0, 0, 1, 0, 0],
      b: [0, 0, 0, 0, 0, 0, 0, 1],
    })
    expect(mj.ranking()).toStrictEqual([['a'], ['b']])
    expect(mj.restrict(['a'])).toMatchObject({ grades: 8 })
  })

  it('throws on a grade past the last', () => {
    expect(
      () =>
        new MajorityJudgment({
          candidates: ['a'],
          ballots: [{ ranking: [[], [], [], [], [], [], ['a']], weight: 1 }],
        }),
    ).toThrow(RangeError)
  })

  it('gives the worst grade to those a ballot leaves out', () => {
    const input = {
      candidates: ['a', 'b'],
      ballots: [
        { ranking: [['a'], ['b']], weight: 1 },
        { ranking: [[], ['b']], weight: 99 },
        { ranking: [], weight: 5 },
      ],
    }
    const mj = new MajorityJudgment(input)
    expect(mj.judgements()).toStrictEqual({
      a: [1, 0, 0, 0, 0, 99],
      b: [0, 100, 0, 0, 0, 0],
    })
    expect(mj.ranking()).toStrictEqual([['b'], ['a']])
    expect(mj.restrict(['a']).judgements()).toStrictEqual({
      a: [1, 0, 0, 0, 0, 99],
    })
    expect(mj.matrix.array).toStrictEqual([
      [0, 1],
      [99, 0],
    ])

    expect(
      new MajorityJudgment({ ...input, countBlank: true }).judgements(),
    ).toStrictEqual({
      a: [1, 0, 0, 0, 0, 104],
      b: [0, 100, 0, 0, 0, 5],
    })

    const given = new MajorityJudgment({ ...input, unrankedLast: false })
    expect(given.ranking()).toStrictEqual([['a'], ['b']])
    expect(given.matrix.array).toStrictEqual([
      [0, 1],
      [0, 0],
    ])
  })
})
