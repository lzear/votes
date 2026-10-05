import {
  AbsoluteMajority,
  AntiPlurality,
  Approval,
  Baldwin,
  Borda,
  Bucklin,
  Coombs,
  Copeland,
  Election,
  FirstPastThePost,
  InstantRunoff,
  Kemeny,
  MajorityJudgment,
  MaximalLotteries,
  Minimax,
  MinimaxVariant,
  Nanson,
  RandomCandidates,
  RandomizedCondorcet,
  RankedPairs,
  Schulze,
  TwoRoundRunoff,
} from '.'
import {
  abcde,
  balinski,
  closeTo,
  firstRun,
  openTie,
  sW,
} from './test/test-utils'
import { matrixFromBallots, rngGenerator } from './utils'

type ABCD = 'a' | 'b' | 'c' | 'd'
const tieCandidates: ABCD[] = ['a', 'b', 'c', 'd']

// b and c both get 0 first-choice votes → tie for last in round 1
const tieBallots = [
  { ranking: [['d'], ['a'], ['b'], ['c']], weight: 4 },
  { ranking: [['a'], ['b'], ['c'], ['d']], weight: 3 },
] as { ranking: ABCD[][]; weight: number }[]

describe('Test all methods', () => {
  it('votes with anti-plurality', () => {
    const antiPlurality = new AntiPlurality({
      candidates: abcde,
      ballots: balinski,
    })
    expect(antiPlurality.scores()).toStrictEqual({
      a: -64,
      b: -0,
      c: -0,
      d: -0,
      e: -36,
    })
    expect(antiPlurality.ranking()).toStrictEqual([
      ['b', 'c', 'd'],
      ['e'],
      ['a'],
    ])
  })
  it('votes with approval', () => {
    expect(
      new Approval({ candidates: abcde, ballots: balinski }).scores(),
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
  it('votes with bucklin', () => {
    // No majority before third choices.
    expect(
      new Bucklin({ candidates: abcde, ballots: balinski }).scores(),
    ).toStrictEqual({ a: 33, b: 82, c: 100, d: 37, e: 48 })
  })
  it('counts the share of a Bucklin tier across the cut', () => {
    const ballots = [
      { ranking: [['a'], ['b', 'c']] },
      { ranking: [['b'], ['a']] },
    ]
    expect(
      new Bucklin({ candidates: ['a', 'b', 'c'], ballots }).scores(),
    ).toStrictEqual({ a: 2, b: 1.5, c: 0.5 })
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
  it('votes with nanson', () => {
    expect(
      new Nanson({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['c'], ['b'], ['a', 'd', 'e']])
  })
  it('keeps the Condorcet winner of partial ballots (Baldwin, Nanson)', () => {
    // b beats a and c; ranking c alone says nothing about pairs.
    const input = {
      candidates: ['a', 'b', 'c'],
      ballots: [{ ranking: [['c']] }, { ranking: [['b'], ['c', 'a']] }],
      unrankedLast: false,
    }
    expect(new Baldwin(input).ranking()[0]).toStrictEqual(['b'])
    expect(new Nanson(input).ranking()[0]).toStrictEqual(['b'])
  })
  it('votes with two-round runoff', () => {
    expect(
      new TwoRoundRunoff({ candidates: abcde, ballots: balinski }).ranking(),
    ).toStrictEqual([['e'], ['a'], ['b', 'c', 'd']])
  })
  it('counts blank ballots toward majorities with countBlank', () => {
    const input = {
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b'], ['c']], weight: 3 },
        { ranking: [['b'], ['c'], ['a']], weight: 2 },
        { ranking: [], weight: 2 },
      ],
    }
    const counted = { ...input, countBlank: true }
    for (const Method of [AbsoluteMajority, Coombs, TwoRoundRunoff])
      expect(new Method(input).ranking()).toStrictEqual([['a'], ['b', 'c']])
    expect(new AbsoluteMajority(counted).ranking()).toStrictEqual([
      ['a', 'b', 'c'],
    ])
    expect(new Coombs(counted).ranking()).toStrictEqual([['a'], ['b'], ['c']])
    expect(new TwoRoundRunoff(counted).ranking()).toStrictEqual([
      ['a'],
      ['b'],
      ['c'],
    ])
  })

  it('sees no majority in an even split of fractional weights', () => {
    const ballots = [
      { ranking: [['a']], weight: 0.6 },
      { ranking: [['b']], weight: 0.4 },
      { ranking: [['b']], weight: 0.2 },
    ]
    expect(
      new AbsoluteMajority({ candidates: ['a', 'b'], ballots }).ranking(),
    ).toStrictEqual([['a', 'b']])
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
  it('throws on kemeny past 30 candidates', () => {
    // 32 used to tie everyone: 1 << 32 is 1.
    const candidates = Array.from({ length: 32 }, (_, i) => `c${i}`)
    expect(() => new Kemeny({ candidates, ballots: [] }).ranking()).toThrow(
      RangeError,
    )
  })

  it('averages kemeny scores over the best orders', () => {
    const cycle = [
      { ranking: [['a'], ['b'], ['c']], weight: 1 },
      { ranking: [['b'], ['c'], ['a']], weight: 1 },
      { ranking: [['c'], ['a'], ['b']], weight: 1 },
    ]
    expect(
      new Kemeny(matrixFromBallots(cycle, ['a', 'b', 'c'])).scores(),
    ).toStrictEqual({ a: 1, b: 1, c: 1 })
  })
  it('votes with randomizedCondorcet', () => {
    expect(
      new RandomizedCondorcet(matrixFromBallots(sW, abcde)).probabilities(),
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
  it('ties Schulze candidates neither of whom beats the other', () => {
    // Nobody beats a or b on beatpaths; b beats c.
    const ballots = [
      { ranking: [['a'], ['b'], ['c']], weight: 1 },
      { ranking: [['b'], ['c'], ['a']], weight: 1 },
    ]
    expect(
      new Schulze(matrixFromBallots(ballots, ['a', 'b', 'c'])).ranking(),
    ).toStrictEqual([['a', 'b'], ['c']])
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
    expect(
      new MaximalLotteries(matrixFromBallots(sW, abcde)).probabilities(),
    ).toEqual({
      a: closeTo(3 / 11, 6),
      b: 0,
      c: closeTo(1 / 11, 6),
      d: 0,
      e: closeTo(7 / 11, 6),
    })
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

describe('round tiebreakers', () => {
  it('InstantRunoff alone eliminates all tied-last candidates', () => {
    const irv = new InstantRunoff({
      candidates: tieCandidates,
      ballots: tieBallots,
    })
    expect(irv.rounds()[0]?.eliminated).toStrictEqual(['b', 'c'])
  })

  it('InstantRunoff breaks a round tie with the methods after it', () => {
    const { rounds } = firstRun({
      candidates: tieCandidates,
      ballots: tieBallots,
      methods: [InstantRunoff, Borda],
    })
    expect(rounds[0]?.eliminated).toStrictEqual(['c'])
  })

  it('Nanson breaks a complete tie with the methods after it', () => {
    // A Condorcet cycle: every Borda score equals the average.
    const { rounds } = firstRun({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b'], ['c']], weight: 1 },
        { ranking: [['b'], ['c'], ['a']], weight: 1 },
        { ranking: [['c'], ['a'], ['b']], weight: 1 },
      ],
      methods: [Nanson, RandomCandidates.with({ rng: () => 0 })],
    })
    expect(rounds[0]).toMatchObject({
      qualified: ['b', 'c'],
      eliminated: ['a'],
    })
  })

  it('takes MajorityJudgment as a tiebreaker', () => {
    const { rounds } = firstRun({
      candidates: tieCandidates,
      ballots: tieBallots,
      methods: [InstantRunoff, MajorityJudgment],
    })
    expect(rounds[0]?.eliminated).toStrictEqual(['c'])
  })

  it('keeps tied candidates a tiebreaker does not rank', () => {
    // Ranks only the first candidate it is given.
    class FirstOnly {
      private readonly first: ABCD[]
      constructor({ candidates }: { candidates: readonly ABCD[] }) {
        this.first = candidates.slice(0, 1)
      }

      ranking(): ABCD[][] {
        return [this.first]
      }

      restrict(candidates: ABCD[]) {
        return new FirstOnly({ candidates })
      }
    }
    const { rounds } = firstRun({
      candidates: tieCandidates,
      ballots: tieBallots,
      methods: [InstantRunoff, FirstOnly],
    })
    expect(rounds[0]).toMatchObject({
      qualified: ['d', 'a', 'b'],
      eliminated: ['c'],
    })
  })

  it('keeps round tiebreakers on restrict', () => {
    const election = new Election({
      candidates: tieCandidates,
      ballots: tieBallots,
      methods: [InstantRunoff, Borda],
    })
    // Restricted to {a, b, c}, b and c tie on first choices; Borda splits them.
    expect(election.restrict(['a', 'b', 'c']).ranking()).toStrictEqual([
      ['a'],
      ['b'],
      ['c'],
    ])
  })

  it('passes options to matrix tiebreakers', () => {
    const ballots: { ranking: ABCD[][]; weight: number }[] = [
      { ranking: [['d'], ['b'], ['c']], weight: 1 },
      { ranking: [['d'], ['c'], ['b'], ['a']], weight: 1 },
      { ranking: [['a'], ['b']], weight: 1 },
    ]
    const irv = (variant: MinimaxVariant) =>
      firstRun({
        candidates: tieCandidates,
        ballots,
        methods: [InstantRunoff, Minimax.with({ mode: 'full', variant })],
      }).ranking
    expect(irv(MinimaxVariant.Margins)).toStrictEqual([
      ['d'],
      ['a'],
      ['b'],
      ['c'],
    ])
    expect(irv(MinimaxVariant.PairwiseOpposition)).toStrictEqual([
      ['d'],
      ['a'],
      ['b', 'c'],
    ])
  })

  it("forwards the election's unrankedLast setting into ballot tiebreakers", () => {
    // First choices: a=1, b=1, c=2 → a and b tie for elimination.
    const input = {
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a']], weight: 1 },
        { ranking: [['b'], ['a']], weight: 1 },
        { ranking: [['c']], weight: 2 },
      ],
    }
    const irv = (unrankedLast: boolean) =>
      firstRun({ ...input, unrankedLast, methods: [InstantRunoff, Borda] })
    const borda = ({ rounds }: ReturnType<typeof irv>) =>
      rounds[0]?.tieBreakSteps?.[0]?.scores
    // Default (unranked appended): Borda on {a, b} ties 6–6. Which goes out
    // decides the winner: a and c can win.
    const appended = irv(true)
    expect(borda(appended)).toStrictEqual({ a: 6, b: 6 })
    expect(appended.ranking).toStrictEqual([['a', 'c'], ['b']])
    // Expressed-only: the a-only and c-only ballots give b nothing → Borda
    // scores a=3, b=2 → b alone eliminated.
    const expressed = irv(false)
    expect(borda(expressed)).toStrictEqual({ a: 3, b: 2 })
    expect(expressed.rounds[0]?.eliminated).toStrictEqual(['b'])
  })

  it("forwards the election's countBlank setting into tiebreakers", () => {
    // a and b tie on first choices; among them, a leads 5 to 2.
    const input = {
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b'], ['c']], weight: 2 },
        { ranking: [['b'], ['a'], ['c']], weight: 2 },
        { ranking: [['c'], ['a'], ['b']], weight: 3 },
        { ranking: [], weight: 6 },
      ],
    }
    const promoted = (countBlank: boolean) =>
      firstRun({
        ...input,
        countBlank,
        methods: [InstantRunoff, AbsoluteMajority],
      }).rounds[0]?.tieBreakSteps?.[0]?.resolved
    // 5 of the 7 ballots cast are a majority, 5 of all 13 are not.
    expect(promoted(false)).toStrictEqual(['a'])
    expect(promoted(true)).toStrictEqual([])
  })

  it("forwards the election's unrankedLast setting into matrix tiebreakers", () => {
    const input = {
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a']], weight: 1 },
        { ranking: [['b'], ['a']], weight: 1 },
        { ranking: [['c']], weight: 2 },
      ],
    }
    const irv = (unrankedLast: boolean) =>
      firstRun({ ...input, unrankedLast, methods: [InstantRunoff, Copeland] })
        .rounds[0]
    // Default: a beats b on the a-only ballot, b beats a on the other.
    expect(irv(true)?.tieBreakSteps?.[0]?.remaining).toStrictEqual(['a', 'b'])
    // Expressed-only: the a-only ballot says nothing about b.
    expect(irv(false)?.eliminated).toStrictEqual(['a'])
    expect(
      new InstantRunoff({ ...input, unrankedLast: false }).matrix.array,
    ).toStrictEqual([
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 0],
    ])
  })

  it('keeps the grades of a majority judgment tiebreaker', () => {
    // Tiers are grades: a gets 0 and 1, b gets 3 and 0. Ranked, they tie.
    const { ranking } = firstRun({
      candidates: ['a', 'b'],
      ballots: [
        { ranking: [['a'], [], [], ['b']], weight: 1 },
        { ranking: [['b'], ['a']], weight: 1 },
      ],
      methods: [InstantRunoff, MajorityJudgment],
    })
    expect(ranking).toStrictEqual([['a'], ['b']])
  })

  it('builds matrix methods from ballots, honoring unrankedLast', () => {
    const ballots = [
      { ranking: [['a']], weight: 1 },
      { ranking: [['b'], ['a']], weight: 1 },
    ]
    const candidates = ['a', 'b', 'c']
    expect(new Copeland({ candidates, ballots }).matrix).toStrictEqual(
      matrixFromBallots(ballots, candidates),
    )
    expect(
      new Copeland({ candidates, ballots, unrankedLast: false }).matrix,
    ).toStrictEqual(matrixFromBallots(ballots, candidates, false))
  })

  // b and c tie for last, and every method sees them alike.
  const symmetric = {
    candidates: ['a', 'b', 'c'],
    ballots: [
      { ranking: [['a'], ['b'], ['c']], weight: 2 },
      { ranking: [['a'], ['c'], ['b']], weight: 2 },
    ],
  }

  it('Baldwin alone eliminates all tied-last candidates', () => {
    expect(new Baldwin(symmetric).rounds()[0]?.eliminated).toStrictEqual([
      'b',
      'c',
    ])
  })

  it('Baldwin keeps a tie the methods after it cannot break', () => {
    const { ranking, rounds } = firstRun({
      ...symmetric,
      methods: [Baldwin, Borda],
    })
    expect(rounds[0]?.eliminated).toStrictEqual(['b', 'c'])
    expect(ranking).toStrictEqual([['a'], ['b', 'c']])
  })

  it('tries each next method while the tie holds', () => {
    const { rounds } = firstRun({
      ...symmetric,
      methods: [Baldwin, Copeland, Borda],
    })
    expect(rounds[0]?.tieBreakSteps?.map(({ name }) => name)).toStrictEqual([
      'Copeland',
      'Borda',
    ])
    expect(rounds[0]?.eliminated).toStrictEqual(['b', 'c'])
  })
})

describe('a tie no tiebreaker breaks', () => {
  it('stops the count on those who win in some order of breaking it', () => {
    for (const Method of [InstantRunoff, TwoRoundRunoff])
      expect(new Method(openTie).ranking()).toStrictEqual([
        ['b', 'd'],
        ['c'],
        ['a', 'e'],
      ])
  })

  it('ends the rounds on them', () => {
    const rounds = new InstantRunoff(openTie).rounds()
    expect(rounds.map((r) => [r.qualified, r.eliminated])).toStrictEqual([
      [
        ['c', 'b', 'd'],
        ['a', 'e'],
      ],
      [['b', 'd'], ['c']],
    ])
  })
})

describe('Election method options', () => {
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
    const irv = firstRun({
      candidates: candidates3,
      ballots: asymmetricBallots,
      methods: [InstantRunoff, Borda],
    })
    expect(irv.rounds[0]?.eliminated).toStrictEqual(['c'])
  })

  it('matrix method (Copeland) as a tiebreaker', () => {
    // Copeland restricted to [b,c]: b beats c (3 voters) vs c beats b (2 voters) → b=1 win
    const irv = firstRun({
      candidates: candidates3,
      ballots: asymmetricBallots,
      methods: [InstantRunoff, Copeland],
    })
    expect(irv.rounds[0]?.eliminated).toStrictEqual(['c'])
  })

  it('with() passes options to the constructor', () => {
    // RandomCandidates takes { candidates, rng }: rng comes through with()
    const rng = rngGenerator('deterministic-seed')
    const irv = firstRun({
      candidates: candidates3,
      ballots: asymmetricBallots,
      methods: [InstantRunoff, RandomCandidates.with({ rng })],
    })
    expect(irv.rounds[0]?.eliminated).toHaveLength(1)
  })

  it("mode 'full' ranks a tie among all candidates, not the tied ones", () => {
    // Restricted FPTP on [b,c]: ballot1 → b first, ballot2 → c first → b=3, c=2 → c eliminated
    // Full FPTP on [a,b,c]: a=5, b=0, c=0 → [[a],[b,c]] filtered to [b,c] → tied → both eliminated
    const restricted = firstRun({
      candidates: candidates3,
      ballots: asymmetricBallots,
      methods: [InstantRunoff, FirstPastThePost],
    })
    const full = firstRun({
      candidates: candidates3,
      ballots: asymmetricBallots,
      methods: [InstantRunoff, FirstPastThePost.with({ mode: 'full' })],
    })
    expect(restricted.rounds[0]?.eliminated).toStrictEqual(['c'])
    expect(full.rounds[0]?.eliminated).toStrictEqual(['b', 'c'])
  })

  it("mode 'recursive' re-ranks each tie that leaves until none splits", () => {
    // 3-way tie [b,c,d] at bottom (all 0 first-choice votes)
    // Borda restricted to [b,c,d]:
    //   ballot1(w=1): b=3,c=2,d=1 → ballot2(w=1): b=3,d=2,c=1 → b=6,c=3,d=3
    // First pass: [[b],[c,d]] → c,d still tied (length 2 < tied 3 → recurse on [c,d])
    // Borda on [c,d]: ballot1 c>d(+2), ballot2 d>c(+2) → c=d → no split, stop
    // Result: b survives, c and d both eliminated (tie unresolvable)
    const irv = firstRun({
      candidates: ['a', 'b', 'c', 'd'],
      ballots: [
        { ranking: [['a'], ['b'], ['c'], ['d']], weight: 1 },
        { ranking: [['a'], ['b'], ['d'], ['c']], weight: 1 },
      ],
      methods: [InstantRunoff, Borda.with({ mode: 'recursive' })],
    })
    const eliminated = irv.rounds[0]?.eliminated
    expect(eliminated).toHaveLength(2)
    expect(eliminated).toContain('c')
    expect(eliminated).toContain('d')
    expect(eliminated).not.toContain('b')
  })

  it("mode 'restricted' (default) eliminates an unresolved sub-tie at once", () => {
    // Same scenario: sub-tie [c,d] is not re-ranked. Same result (both out),
    // for another reason: after one pass promotes [b], [c,d] goes out.
    const irv = firstRun({
      candidates: ['a', 'b', 'c', 'd'],
      ballots: [
        { ranking: [['a'], ['b'], ['c'], ['d']], weight: 1 },
        { ranking: [['a'], ['b'], ['d'], ['c']], weight: 1 },
      ],
      methods: [InstantRunoff, Borda],
    })
    const eliminated = irv.rounds[0]?.eliminated
    expect(eliminated).toHaveLength(2)
    expect(eliminated).not.toContain('b')
  })

  it('type-checks options', () => {
    // @ts-expect-error: Borda takes no rng.
    Borda.with({ rng: Math.random })
    // @ts-expect-error: not a mode.
    Borda.with({ mode: 'stable' })
    expect(RandomCandidates.with({ rng: Math.random })[0]).toBe(
      RandomCandidates,
    )
  })
})
