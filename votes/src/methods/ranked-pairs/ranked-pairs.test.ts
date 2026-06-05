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
    expect(
      new RankedPairs({
        array: [
          [0, 1, -1, -1, -1, -1, 1, -1, 1],
          [-1, 0, -1, 1, -1, -1, -1, 1, -1],
          [1, 1, 0, 1, -1, 0, 1, -1, 0],
          [1, -1, -1, 0, -1, -1, 0, -1, 0],
          [1, 1, 1, 1, 0, -1, 1, -1, 1],
          [1, 1, 0, 1, 1, 0, 0, -1, 1],
          [-1, 1, -1, 0, -1, 0, 0, -1, -1],
          [1, -1, 1, 1, 1, 1, 1, 0, 1],
          [-1, 1, 0, 0, -1, -1, 1, -1, 0],
        ],
        candidates: [
          'bwLvxwn4',
          'Bi8rD2kq',
          'XuHBc1ME',
          'xhAvdxz2',
          'MBDuJLcU',
          'aBlNHn78L',
          'hNtQKVPG',
          'KXxHiFYK',
          'aAWfQstO',
        ],
      }).scores(),
    ).toEqual({
      aAWfQstO: 3,
      aBlNHn78L: 4,
      Bi8rD2kq: 1,
      KXxHiFYK: 4,
      MBDuJLcU: 4,
      XuHBc1ME: 4,
      bwLvxwn4: 4,
      hNtQKVPG: 2,
      xhAvdxz2: 4,
    })
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
      // Simultaneous: simple 3-cycle → all lowlinks equal → none locked → lower-value
      // edges determine result → b wins. Sequential: c→a then a→b locked → c wins.
      const rawCounts = {
        array: [
          [0, 4, 3], // a→b:4 (total 6), a→c:3 (total 7)
          [2, 0, 4], // b→a:2,           b→c:4 (total 5)
          [4, 1, 0], // c→a:4 (total 7), c→b:1
        ],
        candidates: ['a', 'b', 'c'],
      }

      // simultaneous: 3-cycle locked simultaneously → none kept → b wins via lower edges
      expect(new RankedPairs(rawCounts).ranking()).toStrictEqual([
        ['b'],
        ['c'],
        ['a'],
      ])

      // sequential byTotalParticipation: c→a(7) then a→b(6) locked, b→c skipped → c wins
      expect(
        new RankedPairs({
          ...rawCounts,
          edgeSorter: byTotalParticipation,
        }).ranking(),
      ).toStrictEqual([['c'], ['a'], ['b']])
    })
  })
})
