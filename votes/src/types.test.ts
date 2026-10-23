import {
  type Ballot,
  Borda,
  Election,
  groupBallots,
  matrixFromBallots,
  normalizeBallots,
  Schulze,
} from '.'

const candidates = ['a', 'b', 'c'] as const
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
})
