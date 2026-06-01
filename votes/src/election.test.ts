import {
  Baldwin,
  Borda,
  copelandTieBreaker,
  Election,
  rngGenerator,
  rngTieBreaker,
  type TieBreaker,
} from '.'

type ABC = 'a' | 'b' | 'c'
const candidates: ABC[] = ['a', 'b', 'c']

// a wins clearly; b and c tie (equal borda scores from these ballots)
const tieBallots = [
  { ranking: [['a'], ['b'], ['c']], weight: 2 },
  { ranking: [['a'], ['c'], ['b']], weight: 2 },
]

describe('Election', () => {
  it('returns primary ranking when no ties', () => {
    const election = new Election({
      rankers: [new Baldwin({ ballots: tieBallots, candidates })],
    })
    expect(election.ranking()[0]).toStrictEqual(['a'])
  })

  it('fallback ranker breaks ties in final result', () => {
    const bordaFallback = new Borda({
      candidates,
      ballots: [{ ranking: [['c'], ['a'], ['b']], weight: 1 }],
    })
    const election = new Election({
      rankers: [
        new Baldwin({ ballots: tieBallots, candidates, tieBreakers: [] }),
        bordaFallback,
      ],
    })
    // Baldwin (no mid-round tiebreak) may produce ties; Borda fallback resolves
    const ranking = election.ranking()
    expect(ranking.flat()).toStrictEqual(['a', 'c', 'b'])
  })

  it('rngTieBreaker as fallback produces fully resolved ranking', () => {
    const election = new Election({
      rankers: [
        new Baldwin({ ballots: tieBallots, candidates, tieBreakers: [] }),
        rngTieBreaker(rngGenerator('seed')),
      ],
    })
    const ranking = election.ranking()
    expect(ranking.every((r) => r.length === 1)).toBe(true)
  })

  it('copelandTieBreaker as fallback', () => {
    const election = new Election({
      rankers: [
        new Baldwin({ ballots: tieBallots, candidates, tieBreakers: [] }),
        copelandTieBreaker(tieBallots, candidates),
      ],
    })
    const ranking = election.ranking()
    expect(ranking[0]).toStrictEqual(['a'])
  })

  it('stops early when no ties remain', () => {
    const sentinel: TieBreaker<ABC> = {
      tieBreak: () => {
        throw new Error('should not be called')
      },
    }
    const election = new Election({
      rankers: [
        new Borda({
          candidates,
          ballots: [{ ranking: [['a'], ['b'], ['c']], weight: 1 }],
        }),
        sentinel,
      ],
    })
    expect(() => election.ranking()).not.toThrow()
  })
})
