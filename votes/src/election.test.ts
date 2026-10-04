import {
  AbsoluteMajority,
  Baldwin,
  type Ballot,
  Borda,
  Copeland,
  Election,
  FirstPastThePost,
  InstantRunoff,
  MajorityJudgment,
  RandomCandidates,
  type Ranker,
  rngGenerator,
  tb,
} from '.'

type ABC = 'a' | 'b' | 'c'
const candidates: ABC[] = ['a', 'b', 'c']

// a wins clearly; b and c tie (equal borda scores from these ballots)
const tieBallots: Ballot<ABC>[] = [
  { ranking: [['a'], ['b'], ['c']], weight: 2 },
  { ranking: [['a'], ['c'], ['b']], weight: 2 },
]

// Borda ties b and c. On first choices, b beats c head to head, but c beats
// b among everyone.
const ballots: Ballot<ABC>[] = [
  { ranking: [['a'], ['b'], ['c']], weight: 2 },
  { ranking: [['c'], ['a'], ['b']], weight: 1 },
]

describe('Election', () => {
  it('returns the first method ranking', () => {
    const election = new Election({
      candidates,
      ballots: tieBallots,
      methods: [Baldwin],
    })
    expect(election.ranking()).toStrictEqual([['a'], ['b', 'c']])
  })

  it('re-ranks each tie on its own, or everyone with full', () => {
    const fptp = new Election({
      candidates,
      ballots,
      methods: [Borda, FirstPastThePost],
    })
    expect(fptp.ranking()).toStrictEqual([['a'], ['b'], ['c']])

    const full = new Election({
      candidates,
      ballots,
      methods: [Borda, tb(FirstPastThePost, { full: true })],
    })
    expect(full.ranking()).toStrictEqual([['a'], ['c'], ['b']])
  })

  it('records each step', () => {
    const election = new Election({
      candidates,
      ballots,
      methods: [Borda, FirstPastThePost],
    })
    expect(election.result().steps).toStrictEqual([
      {
        name: 'Borda',
        before: [['a', 'b', 'c']],
        after: [['a'], ['b', 'c']],
        runs: [
          {
            candidates: ['a', 'b', 'c'],
            ranking: [['a'], ['b', 'c']],
            scores: { a: 8, b: 5, c: 5 },
          },
        ],
      },
      {
        name: 'FirstPastThePost',
        before: [['a'], ['b', 'c']],
        after: [['a'], ['b'], ['c']],
        runs: [
          {
            candidates: ['b', 'c'],
            ranking: [['b'], ['c']],
            scores: { b: 2, c: 1 },
          },
        ],
      },
    ])
  })

  it('labels steps and keeps their rounds', () => {
    const [step] = new Election({
      candidates,
      ballots,
      methods: [tb(InstantRunoff, { label: 'IRV' })],
    }).result().steps
    expect(step?.name).toBe('IRV')
    expect(step?.runs[0]?.rounds).toHaveLength(2)
  })

  it('RandomCandidates as fallback produces fully resolved ranking', () => {
    const election = new Election({
      candidates,
      ballots: tieBallots,
      methods: [Baldwin, tb(RandomCandidates, { rng: rngGenerator('seed') })],
    })
    const ranking = election.ranking()
    expect(ranking.every((r) => r.length === 1)).toBe(true)
  })

  it('Copeland as fallback', () => {
    const election = new Election({
      candidates,
      ballots: tieBallots,
      methods: [Baldwin, Copeland],
    })
    expect(election.ranking()[0]).toStrictEqual(['a'])
  })

  it("uses each method's own ranking", () => {
    // No majority: a leads on first choices but must not be ranked first.
    const election = new Election({
      candidates,
      ballots: [
        { ranking: [['a'], ['b'], ['c']], weight: 2 },
        { ranking: [['b'], ['c'], ['a']], weight: 2 },
        { ranking: [['c'], ['b'], ['a']], weight: 1 },
      ],
      methods: [AbsoluteMajority],
    })
    expect(election.ranking()).toStrictEqual([['a', 'b', 'c']])
  })

  it('keeps candidates a fallback method does not rank', () => {
    class OnlyB implements Ranker<ABC> {
      ranking(): ABC[][] {
        return [['b']]
      }

      restrict() {
        return this
      }
    }
    const election = new Election({
      candidates,
      ballots: tieBallots,
      methods: [Borda, OnlyB],
    })
    expect(election.ranking()).toStrictEqual([['a'], ['b'], ['c']])
  })

  it('ranks like its method alone, tiebreakers included', () => {
    // a and b tie on grades, those left out getting the worst one.
    const irv = tb(InstantRunoff, { tieBreakers: [MajorityJudgment] })
    const election = new Election({
      candidates,
      ballots: [{ ranking: [['a']] }, { ranking: [['b'], ['c']] }],
      methods: [irv],
    })
    expect(election.ranking()).toStrictEqual([['a', 'b'], ['c']])
  })

  it('stops early when no ties remain', () => {
    class Unreachable implements Ranker<ABC> {
      ranking(): ABC[][] {
        throw new Error('should not be called')
      }

      restrict() {
        return this
      }
    }
    const election = new Election({
      candidates,
      ballots: [{ ranking: [['a'], ['b'], ['c']], weight: 1 }],
      methods: [Borda, Unreachable],
    })
    expect(() => election.ranking()).not.toThrow()
  })
})
