import { matrixFromBallots } from '../../utils/make-matrix'
import { byTotalParticipation, RankedPairs } from '.'

const example1 = [
  [0, -2, 8],
  [2, 0, -4],
  [-8, 4, 0],
]

const example2 = [
  [0, -4, -4, -4, -4],
  [4, 0, -2, 8, 6],
  [4, 2, 0, -4, 2],
  [4, -8, 4, 0, 6],
  [4, -6, -2, -6, 0],
]

const example3 = [
  [0, -5, 7, 15, -1],
  [5, 0, -13, 21, -9],
  [-7, 13, 0, -11, 3],
  [-15, -21, 11, 0, -22],
  [1, 9, -3, 22, 0],
]

const candidates = ['a', 'b', 'c', 'd', 'e']

const example4 = [
  [0, 1, -1, -1, -1, -1, 1, -1, 1],
  [-1, 0, -1, 1, -1, -1, -1, 1, -1],
  [1, 1, 0, 1, -1, 0, 1, -1, 0],
  [1, -1, -1, 0, -1, -1, 0, -1, 0],
  [1, 1, 1, 1, 0, -1, 1, -1, 1],
  [1, 1, 0, 1, 1, 0, 0, -1, 1],
  [-1, 1, -1, 0, -1, 0, 0, -1, -1],
  [1, -1, 1, 1, 1, 1, 1, 0, 1],
  [-1, 1, 0, 0, -1, -1, 1, -1, 0],
]

const candidates4 = [
  'bwLvxwn4',
  'Bi8rD2kq',
  'XuHBc1ME',
  'xhAvdxz2',
  'MBDuJLcU',
  'aBlNHn78L',
  'hNtQKVPG',
  'KXxHiFYK',
  'aAWfQstO',
]

describe('ranked pairs', () => {
  it('works with "simple" example', () => {
    expect(
      new RankedPairs({
        array: example1,
        candidates: ['a', 'b', 'c'],
      }).scores(),
    ).toEqual({
      a: 3,
      b: 1,
      c: 2,
    })
  })
  it('works with "complexer" example', () => {
    expect(new RankedPairs({ array: example2, candidates }).scores()).toEqual({
      a: 1,
      b: 5,
      c: 3,
      d: 4,
      e: 2,
    })
  })
  it('works with "example3" example', () => {
    expect(
      new RankedPairs({
        array: example3,
        candidates: ['a', 'b', 'c', 'd', 'e'],
      }).scores(),
    ).toEqual({
      a: 5,
      b: 2,
      c: 4,
      d: 1,
      e: 3,
    })
  })
  it('completes computation in decent time', () => {
    // Every win has the same strength and every candidate sits on one cycle,
    // so no edge can be locked: a full tie.
    expect(
      new RankedPairs({ array: example4, candidates: candidates4 }).scores(),
    ).toEqual(Object.fromEntries(candidates4.map((c) => [c, 1])))
  })

  it('ranks a Condorcet winner first', () => {
    // c beats a and b 3-1; a and b tie 2-2.
    const ballots = [
      { ranking: [['c'], ['b'], ['a']], weight: 2 },
      { ranking: [['a'], ['b'], ['c']], weight: 1 },
      { ranking: [['c'], ['a'], ['b']], weight: 1 },
    ]
    expect(
      new RankedPairs(matrixFromBallots(ballots, ['a', 'b', 'c'])).ranking(),
    ).toStrictEqual([['c'], ['a', 'b']])
  })

  it('does not depend on candidate order', () => {
    const rankings = new Set(
      candidates4.map((_c, shift) => {
        const order = candidates4.map((_c, i) => (i + shift) % 9)
        const ranking = new RankedPairs({
          array: order.map((i) => order.map((j) => example4[i]![j]!)),
          candidates: order.map((i) => candidates4[i]!),
        }).ranking()
        return JSON.stringify(
          ranking.map((tier) => tier.toSorted((a, b) => a.localeCompare(b))),
        )
      }),
    )
    expect(rankings.size).toBe(1)
  })

  describe('equal-strength edges forming a cycle', () => {
    // a>b, b>c, c>a all with equal margin — a perfect 3-cycle
    const cycle = {
      array: [
        [0, 1, -1],
        [-1, 0, 1],
        [1, -1, 0],
      ],
      candidates: ['a', 'b', 'c'],
    }

    it('simultaneous (default): no edge locked, all tied', () => {
      const rp = new RankedPairs(cycle)
      expect(rp.ranking()).toStrictEqual([['a', 'b', 'c']])
    })

    it('byTotalParticipation with antisymmetric matrix: all totals=0 → still tied', () => {
      // total = value + (-value) = 0 for all edges in an antisymmetric matrix.
      // Sorter cannot differentiate → falls back to simultaneous → tie preserved.
      const rp = new RankedPairs({ ...cycle, edgeSorter: byTotalParticipation })
      expect(rp.ranking()).toStrictEqual([['a', 'b', 'c']])
    })

    it('sequential with raw-count matrix: byTotalParticipation breaks tie by participation', () => {
      // a→b, b→c, c→a all have raw count=4 (same value group), but different totals:
      //   c-a pair: 4+3=7  ← locked first by byTotalParticipation
      //   a-b pair: 4+2=6  ← locked second
      //   b-c pair: 4+1=5  ← skipped (would close cycle c→a→b→c)
      // Simultaneous: the 3-cycle locks nothing → full tie.
      // Sequential: c→a then a→b locked → c wins.
      const rawCounts = {
        array: [
          [0, 4, 3], // a→b:4 (total 6), a→c:3 (total 7)
          [2, 0, 4], // b→a:2,           b→c:4 (total 5)
          [4, 1, 0], // c→a:4 (total 7), c→b:1
        ],
        candidates: ['a', 'b', 'c'],
      }

      expect(new RankedPairs(rawCounts).ranking()).toStrictEqual([
        ['a', 'b', 'c'],
      ])

      // sequential byTotalParticipation: c→a(7) then a→b(6) locked, b→c skipped → c wins
      expect(
        new RankedPairs({
          ...rawCounts,
          edgeSorter: byTotalParticipation,
        }).ranking(),
      ).toStrictEqual([['c'], ['a'], ['b']])

      // restrict() keeps the sorter
      expect(
        new RankedPairs({ ...rawCounts, edgeSorter: byTotalParticipation })
          .restrict(['a', 'b', 'c'])
          .ranking(),
      ).toStrictEqual([['c'], ['a'], ['b']])
    })
  })

  it('does not infinitely recurse on a raw win-count matrix with wide ties (regression)', () => {
    const rawCounts = {
      array: [
        [0, 58, 49, 54, 64, 70, 57],
        [52, 0, 63, 57, 48, 70, 57],
        [61, 47, 0, 51, 65, 70, 57],
        [56, 53, 59, 0, 50, 70, 57],
        [46, 62, 45, 60, 0, 70, 57],
        [40, 40, 40, 40, 40, 0, 72],
        [53, 53, 53, 53, 53, 38, 0],
      ],
      candidates: ['🐸', '🐷', '🦁', '🐻', '🐭', '🐌', '🪰'],
    }

    expect(new RankedPairs(rawCounts).ranking()).toStrictEqual([
      ['🐷'],
      ['🦁'],
      ['🐸'],
      ['🐭'],
      ['🐻'],
      ['🐌'],
      ['🪰'],
    ])
  })
})
