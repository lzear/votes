import { type Ballot, Borda, Election, matrixFromBallots, Schulze } from '.'

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
})
