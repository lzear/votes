import {
  Approbation,
  Baldwin,
  Borda,
  Coombs,
  Copeland,
  FirstPastThePost,
  InstantRunoff,
  Kemeny,
  MaximalLotteries,
  Minimax,
  Nanson,
  RandomCandidates,
  RandomizedCondorcet,
  RankedPairs,
  Schulze,
  tb,
  TwoRoundRunoff,
} from '.'
import { abcde, balinski, closeTo, sW } from './test/test-utils'
import { matrixFromBallots } from './utils'
import { rngGenerator } from './utils/rng-generator'

type ABCD = 'a' | 'b' | 'c' | 'd'
const tieCandidates: ABCD[] = ['a', 'b', 'c', 'd']

// b and c both get 0 first-choice votes → tie for last in round 1
const tieBallots = [
  { ranking: [['d'], ['a'], ['b'], ['c']], weight: 4 },
  { ranking: [['a'], ['b'], ['c'], ['d']], weight: 3 },
] as { ranking: ABCD[][]; weight: number }[]

describe('Test all methods', () => {
  it('votes with approbation', () => {
    expect(
      new Approbation({ candidates: abcde, ballots: balinski }).scores(),
    ).toStrictEqual({
      a: 33,
      b: 16,
      c: 11,
      d: 18,
      e: 22,
    })
  })
  it('votes with baldwin', () => {
    expect(
      new Baldwin({ ballots: balinski, candidates: abcde }).ranking(),
    ).toStrictEqual([['c'], ['b'], ['d'], ['e'], ['a']])
  })
  it('votes with borda', () => {
    expect(
      new Borda({ candidates: abcde, ballots: balinski }).scores(),
    ).toStrictEqual({
      a: 235,
      b: 347,
      c: 344,
      d: 292,
      e: 282,
    })
  })
  it('votes with coombs', () => {
    expect(
      new Coombs({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['c'], ['b'], ['d'], ['e'], ['a']])
  })
  it('votes with FPTP', () => {
    expect(
      new FirstPastThePost({ candidates: abcde, ballots: balinski }).scores(),
    ).toStrictEqual({
      a: 33,
      b: 16,
      c: 11,
      d: 18,
      e: 22,
    })
  })
  it('votes with instant runoff', () => {
    expect(
      new InstantRunoff({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['d'], ['a'], ['e'], ['b'], ['c']])
  })
  it('votes with instant nanson', () => {
    expect(
      new Nanson({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['c'], ['b'], ['a', 'd', 'e']])
  })
  it('votes with two-round runoff', () => {
    expect(
      new TwoRoundRunoff({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['e'], ['a'], ['d', 'b', 'c']])
  })
  it('votes with copeland', () => {
    expect(
      new Copeland(matrixFromBallots(balinski, abcde)).scores(),
    ).toStrictEqual({
      a: 0,
      b: 3,
      c: 4,
      d: 2,
      e: 1,
    })
  })
  it('votes with kemeny', () => {
    expect(
      new Kemeny(matrixFromBallots(balinski, abcde)).scores(),
    ).toStrictEqual({
      a: 0,
      b: 3,
      c: 4,
      d: 2,
      e: 1,
    })
  })
  it('votes with randomizedCondorcet', () => {
    expect(
      new RandomizedCondorcet(matrixFromBallots(sW, abcde)).scores(),
    ).toEqual({
      a: closeTo(1 / 3, 6),
      b: 0,
      c: closeTo(1 / 3, 6),
      d: 0,
      e: closeTo(1 / 3, 6),
    })
  })
  it('votes with schulze', () => {
    expect(new Schulze(matrixFromBallots(sW, abcde)).scores()).toStrictEqual({
      a: 3,
      b: 1,
      c: 2,
      d: 0,
      e: 4,
    })
  })
  it('votes with minimax', () => {
    expect(new Minimax(matrixFromBallots(sW, abcde)).scores()).toStrictEqual({
      a: -5,
      b: -13,
      c: -11,
      d: -21,
      e: -3,
    })
  })

  it('votes with maximal lotteries', () => {
    expect(new MaximalLotteries(matrixFromBallots(sW, abcde)).scores()).toEqual(
      {
        a: closeTo(3 / 11, 6),
        b: 0,
        c: closeTo(1 / 11, 6),
        d: 0,
        e: closeTo(7 / 11, 6),
      },
    )
  })
  it('votes with ranked pairs', () => {
    expect(
      new RankedPairs(matrixFromBallots(sW, abcde)).scores(),
    ).toStrictEqual({
      a: 5,
      b: 2,
      c: 4,
      d: 1,
      e: 3,
    })
  })
})

describe('tieBreakers', () => {
  it('InstantRunoff with empty tieBreakers eliminates all tied-last candidates', () => {
    const irv = new InstantRunoff({
      candidates: tieCandidates,
      ballots: tieBallots,
      tieBreakers: [],
    })
    expect(irv.computeRounds()[0]?.roundResult.eliminated).toStrictEqual([
      'b',
      'c',
    ])
  })

  it('InstantRunoff with custom tieBreakers chain eliminates one tied-last candidate', () => {
    const irv = new InstantRunoff({
      candidates: tieCandidates,
      ballots: tieBallots,
      tieBreakers: [Borda],
    })
    expect(irv.computeRounds()[0]?.roundResult.eliminated).toStrictEqual(['c'])
  })

  it('Baldwin with empty tieBreakers eliminates all tied-last candidates', () => {
    const ballots = [
      { ranking: [['a'], ['b'], ['c']], weight: 2 },
      { ranking: [['a'], ['c'], ['b']], weight: 2 },
    ]
    const baldwin = new Baldwin({
      candidates: ['a', 'b', 'c'],
      ballots,
      tieBreakers: [],
    })
    expect(baldwin.computeRounds()[0]?.roundResult.eliminated).toStrictEqual([
      'b',
      'c',
    ])
  })

  it('Baldwin with custom tieBreakers chain eliminates one tied-last candidate', () => {
    const ballots = [
      { ranking: [['a'], ['b'], ['c']], weight: 2 },
      { ranking: [['a'], ['c'], ['b']], weight: 2 },
    ]
    const baldwin = new Baldwin({
      candidates: ['a', 'b', 'c'],
      ballots,
      tieBreakers: [Borda],
    })
    expect(baldwin.computeRounds()[0]?.roundResult.eliminated).toStrictEqual([
      'b',
      'c',
    ])
    expect(baldwin.ranking()).toStrictEqual([['a'], ['b', 'c']])
  })

  it('chain tries next tiebreaker when first leaves ties unresolved', () => {
    // b and c tie pairwise (Copeland can't resolve) → falls through to Borda tiebreaker
    const ballots = [
      { ranking: [['a'], ['b'], ['c']], weight: 2 },
      { ranking: [['a'], ['c'], ['b']], weight: 2 },
    ]
    const baldwin = new Baldwin({
      candidates: ['a', 'b', 'c'],
      ballots,
      tieBreakers: [Copeland, Borda],
    })
    // Copeland can't split b/c (tied pairwise), Borda breaks it → b eliminated
    expect(baldwin.computeRounds()[0]?.roundResult.eliminated).toStrictEqual([
      'b',
      'c',
    ])
  })
})

describe('tb() tiebreaker API', () => {
  // a wins FPTP clearly; b preferred over c by 3 voters, c over b by 2
  const candidates3 = ['a', 'b', 'c']
  const asymmetricBallots = [
    { ranking: [['a'], ['b'], ['c']], weight: 3 },
    { ranking: [['a'], ['c'], ['b']], weight: 2 },
  ]

  it('ballot method (Borda) as tiebreaker eliminates weaker tied candidate', () => {
    // Borda restricted to [b,c]: b=14 (3+2 voters both ranked b>c? no — ballot2 prefers c)
    // Ballot1(w=3): b before c → b gets 2, c gets 1 → b+=6, c+=3
    // Ballot2(w=2): c before b → c gets 2, b gets 1 → c+=4, b+=2
    // Total: b=8, c=7 → c eliminated
    const irv = new InstantRunoff({
      candidates: candidates3,
      ballots: asymmetricBallots,
      tieBreakers: [Borda],
    })
    expect(irv.computeRounds()[0]?.roundResult.eliminated).toStrictEqual(['c'])
  })

  it('matrix method (Copeland) auto-detected via needsMatrix', () => {
    // Copeland restricted to [b,c]: b beats c (3 voters) vs c beats b (2 voters) → b=1 win
    const irv = new InstantRunoff({
      candidates: candidates3,
      ballots: asymmetricBallots,
      tieBreakers: [Copeland],
    })
    expect(irv.computeRounds()[0]?.roundResult.eliminated).toStrictEqual(['c'])
  })

  it('tb(Ctor, opts) passes extra params to constructor', () => {
    // RandomCandidates takes { candidates, rng } — no ballots — pass rng via tb()
    const rng = rngGenerator('deterministic-seed')
    const irv = new InstantRunoff({
      candidates: candidates3,
      ballots: asymmetricBallots,
      tieBreakers: [tb(RandomCandidates, { rng })],
    })
    expect(irv.computeRounds()[0]?.roundResult.eliminated).toHaveLength(1)
  })

  it('full: true runs tiebreaker on all candidates instead of tied subset', () => {
    // Restricted FPTP on [b,c]: ballot1 → b first, ballot2 → c first → b=3, c=2 → c eliminated
    // Full FPTP on [a,b,c]: a=5, b=0, c=0 → [[a],[b,c]] filtered to [b,c] → tied → both eliminated
    const restricted = new InstantRunoff({
      candidates: candidates3,
      ballots: asymmetricBallots,
      tieBreakers: [FirstPastThePost],
    })
    const full = new InstantRunoff({
      candidates: candidates3,
      ballots: asymmetricBallots,
      tieBreakers: [tb(FirstPastThePost, { full: true })],
    })
    expect(restricted.computeRounds()[0]?.roundResult.eliminated).toStrictEqual(
      ['c'],
    )
    expect(full.computeRounds()[0]?.roundResult.eliminated).toStrictEqual([
      'b',
      'c',
    ])
  })

  it('stable: true recurses into sub-ties until no further progress', () => {
    // 3-way tie [b,c,d] at bottom (all 0 first-choice votes)
    // Borda restricted to [b,c,d]:
    //   ballot1(w=1): b=3,c=2,d=1 → ballot2(w=1): b=3,d=2,c=1 → b=6,c=3,d=3
    // First pass: [[b],[c,d]] → c,d still tied (length 2 < tied 3 → recurse on [c,d])
    // Borda on [c,d]: ballot1 c>d(+2), ballot2 d>c(+2) → c=d → stable, stop
    // Result: b survives, c and d both eliminated (tie unresolvable)
    const irv = new InstantRunoff({
      candidates: ['a', 'b', 'c', 'd'],
      ballots: [
        { ranking: [['a'], ['b'], ['c'], ['d']], weight: 1 },
        { ranking: [['a'], ['b'], ['d'], ['c']], weight: 1 },
      ],
      tieBreakers: [tb(Borda, { stable: true })],
    })
    const eliminated = irv.computeRounds()[0]?.roundResult.eliminated
    expect(eliminated).toHaveLength(2)
    expect(eliminated).toContain('c')
    expect(eliminated).toContain('d')
    expect(eliminated).not.toContain('b')
  })

  it('stable: false (default) eliminates entire unresolved sub-tie at once', () => {
    // Same scenario — without stable, sub-tie [c,d] is not recursed into
    // Result is the same here (both c,d eliminated) but for different reasons:
    // stable=false: after first pass promoted [b], current=[c,d], loop ends, eliminate [c,d]
    const irv = new InstantRunoff({
      candidates: ['a', 'b', 'c', 'd'],
      ballots: [
        { ranking: [['a'], ['b'], ['c'], ['d']], weight: 1 },
        { ranking: [['a'], ['b'], ['d'], ['c']], weight: 1 },
      ],
      tieBreakers: [Borda],
    })
    const eliminated = irv.computeRounds()[0]?.roundResult.eliminated
    expect(eliminated).toHaveLength(2)
    expect(eliminated).not.toContain('b')
  })
})
