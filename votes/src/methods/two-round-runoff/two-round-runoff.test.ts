import { Borda } from '../borda'
import { TwoRoundRunoff } from '.'

describe(TwoRoundRunoff, () => {
  it('skips empty votes', () => {
    expect(
      new TwoRoundRunoff({
        candidates: ['a'],
        ballots: [{ weight: 1, ranking: [] }],
      }).ranking(),
    ).toStrictEqual([['a']])
  })

  it('does not solve absolute ties', () => {
    expect(
      new TwoRoundRunoff({
        candidates: ['a', 'b', 'c'],
        ballots: [{ weight: 1, ranking: [['a', 'b', 'c']] }],
      }).ranking(),
    ).toStrictEqual([['a', 'b', 'c']])
  })

  it('breaks a tie for the second qualifying spot', () => {
    // Firsts: a=5, b=3, c=3 — b and c tied for the 2nd runoff spot.
    const trr = new TwoRoundRunoff({
      candidates: ['a', 'b', 'c', 'd'],
      ballots: [
        { ranking: [['a'], ['b'], ['c'], ['d']], weight: 5 },
        { ranking: [['b'], ['c'], ['a'], ['d']], weight: 3 },
        { ranking: [['c'], ['b'], ['a'], ['d']], weight: 3 },
      ],
      tieBreakers: [Borda],
    })

    const rounds = trr.computeRounds()
    // Borda on the restricted {b, c} ballots promotes b.
    expect(rounds[0]?.roundResult.qualified).toStrictEqual(['a', 'b'])
    expect(rounds[0]?.roundResult.tieBreakSteps?.[0]?.tbName).toBe('Borda')
    // Runoff: c-voters transfer to b — b overtakes a 6 to 5.
    expect(trr.ranking()).toStrictEqual([['b'], ['a'], ['c', 'd']])
  })

  it('sends everyone tied at the cut to the runoff', () => {
    // a, b and c tie for first; d trails and must stay below them.
    const ballots = [
      { ranking: [['a']], weight: 3 },
      { ranking: [['b']], weight: 3 },
      { ranking: [['c']], weight: 3 },
      { ranking: [['d']], weight: 1 },
    ]
    const trr = new TwoRoundRunoff({
      candidates: ['a', 'b', 'c', 'd'],
      ballots,
    })
    expect(trr.computeRounds()[0]?.roundResult.qualified).toStrictEqual([
      'a',
      'b',
      'c',
    ])
    expect(trr.ranking()).toStrictEqual([['a', 'b', 'c'], ['d']])
  })

  it('narrows a wide tie at the cut down to two finalists', () => {
    const ballots = [
      { ranking: [['a'], ['b'], ['c'], ['d']], weight: 2 },
      { ranking: [['b'], ['a'], ['c'], ['d']], weight: 2 },
      { ranking: [['c'], ['a'], ['b'], ['d']], weight: 2 },
      { ranking: [['d'], ['a'], ['b'], ['c']], weight: 2 },
    ]
    const trr = new TwoRoundRunoff({
      candidates: ['a', 'b', 'c', 'd'],
      ballots,
      tieBreakers: [Borda],
    })
    expect(trr.computeRounds()[0]?.roundResult.qualified).toStrictEqual([
      'a',
      'b',
    ])
  })

  it('eliminates everyone on out-of-range round index (safety fallback)', () => {
    class Exposed<C extends string> extends TwoRoundRunoff<C> {
      public roundAt(candidates: C[], idx: number) {
        return this.round(candidates, idx)
      }
    }
    const exposed = new Exposed({
      candidates: ['a', 'b'],
      ballots: [{ ranking: [['a'], ['b']], weight: 1 }],
    })
    expect(exposed.roundAt(['a', 'b'], 2)).toStrictEqual({
      qualified: [],
      eliminated: ['a', 'b'],
      scores: { a: 0, b: 0 },
    })
  })
})
