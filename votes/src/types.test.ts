import {
  type Ballot,
  Borda,
  Election,
  type EntryOptions,
  groupBallots,
  Kemeny,
  matrixFromBallots,
  MaximalLotteries,
  Method,
  methods,
  normalizeBallots,
  type QE,
  RandomizedCondorcet,
  RankedPairs,
  type RankedPairsEdgeSorter,
  type Ranker,
  type Run,
  Schulze,
  TidemanAlternative,
  type TidemanAlternativeTopSet,
  VotingSystem,
} from '.'

const candidates = ['a', 'b', 'c'] as const
const edgeSorter: RankedPairsEdgeSorter = (a, b) => a.total - b.total
const stray = [{ ranking: [['a'], ['d']] }] as const

describe('types', () => {
  it('refuses ballots naming a non-candidate', () => {
    const borda = new Borda({
      candidates,
      // @ts-expect-error: 'd' is no candidate
      ballots: stray,
    })
    expect(borda.scores()).not.toHaveProperty('d')
    const election = new Election({
      candidates,
      // @ts-expect-error: 'd' is no candidate
      ballots: stray,
      methods: [Schulze],
    })
    expect(election.ranking()).toStrictEqual([['a'], ['b', 'c']])
    // @ts-expect-error: 'd' is no candidate
    expect(matrixFromBallots(stray, candidates).array).toHaveLength(3)
  })

  it('takes string ballots once told the candidates are strings', () => {
    const ballots: Ballot<string>[] = [{ ranking: [['a'], ['b']] }]
    const literal = () =>
      new Borda({
        candidates: ['a', 'b'],
        // @ts-expect-error: the literal candidates fix C
        ballots,
      })
    expect(literal().ranking()).toStrictEqual([['a'], ['b']])
    expect(
      new Borda<string>({ candidates: ['a', 'b'], ballots }).ranking(),
    ).toStrictEqual([['a'], ['b']])
  })

  it('types normalized and grouped ballots as they come out', () => {
    const ballots = [
      { ranking: [['a', 'd'], ['b']], id: 1 },
      { ranking: [['b'], ['a']], weight: 2, id: 2 },
    ] as const
    const [normalized] = normalizeBallots(ballots, ['a', 'b'])
    const ranking: ('a' | 'b')[][] | undefined = normalized?.ranking
    expect(ranking).toStrictEqual([['a'], ['b']])
    expect(normalized?.id).toBe(1)
    const [grouped] = groupBallots(ballots)
    const weight: number | undefined = grouped?.weight
    expect(weight).toBe(2)
    expect(grouped?.id).toBe(2)
  })

  it('names the types public signatures use', () => {
    const topSet: TidemanAlternativeTopSet = 'schwartz'
    const entry: EntryOptions = { mode: 'full', label: 'Pairs' }
    const pairs = RankedPairs.with({ edgeSorter, ...entry })
    const tideman = new TidemanAlternative({ candidates, ballots: [], topSet })
    expect(tideman).toBeInstanceOf(Method)
    const election = new Election({
      candidates,
      ballots: [{ ranking: [['a'], ['b'], ['c']] }],
      methods: [pairs],
    })
    const runs: readonly Run<'a' | 'b' | 'c'>[] =
      election.result().steps[0]?.runs ?? []
    expect(runs).toHaveLength(1)
    const round: QE<'a'> = {
      qualified: ['a'],
      eliminated: [],
      scores: { a: 1 },
    }
    expect(round.qualified).toStrictEqual(['a'])
  })

  it('iterates the ranking of any ranker', () => {
    const ranker: Ranker<'a' | 'b' | 'c'> = new methods[VotingSystem.Borda]({
      candidates,
      ballots: [{ ranking: [['a'], ['b'], ['c']] }],
    })
    expect(ranker.iteratedRanking()).toStrictEqual([['a'], ['b'], ['c']])
  })

  it('takes undefined for any option left out', () => {
    const profile = {
      candidates,
      ballots: [{ ranking: [['a'], ['b'], ['c']], weight: undefined }] as const,
      unrankedLast: undefined,
      countBlank: undefined,
    }
    const ranking = [['a'], ['b'], ['c']]
    expect(new Borda(profile).ranking()).toStrictEqual(ranking)
    expect(
      new Kemeny({ ...profile, maxCandidates: undefined }).ranking(),
    ).toStrictEqual(ranking)
    expect(
      new MaximalLotteries({ ...profile, rng: undefined }).ranking()[0],
    ).toStrictEqual(['a'])
    expect(
      new RandomizedCondorcet({ ...profile, rng: undefined }).ranking()[0],
    ).toStrictEqual(['a'])
    const election = new Election({
      ...profile,
      methods: [
        MaximalLotteries.with({ rng: undefined, mode: undefined }),
        RandomizedCondorcet.with({ rng: undefined, label: undefined }),
      ],
    })
    expect(election.ranking()[0]).toStrictEqual(['a'])
  })
})
