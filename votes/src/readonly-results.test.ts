import {
  Borda,
  Copeland,
  Election,
  InstantRunoff,
  MajorityJudgment,
  RandomCandidates,
  RandomDictator,
  rngGenerator,
} from '.'

const candidates = ['a', 'b', 'c']
const ballots = [
  { ranking: [['a'], ['b'], ['c']], weight: 4 },
  { ranking: [['b'], ['a'], ['c']], weight: 3 },
  { ranking: [['c'], ['b'], ['a']], weight: 2 },
]

// Each mutation is a type error, and forced through anyway, it throws on a
// frozen cache or changes only a fresh copy.
describe('readonly results', () => {
  it('keeps the rounds out of reach of ranking()', () => {
    const irv = new InstantRunoff({ candidates, ballots })
    const rounds = structuredClone(irv.rounds())
    expect(() => {
      // @ts-expect-error ranking tiers are readonly
      irv.ranking()[0]?.push('zz')
    }).toThrow(TypeError)
    expect(() => {
      // @ts-expect-error rounds are readonly
      irv.rounds()[0]?.eliminated.push('zz')
    }).toThrow(TypeError)
    // @ts-expect-error rounds are readonly
    expect(() => irv.rounds().pop()).toThrow(TypeError)
    expect(irv.rounds()).toStrictEqual(rounds)
    expect(irv.ranking()).toStrictEqual([['b'], ['a'], ['c']])
  })

  it('keeps the election result', () => {
    const election = new Election({
      candidates,
      ballots,
      methods: [Borda, Copeland],
    })
    const result = structuredClone(election.result())
    expect(() => {
      // @ts-expect-error the ranking is readonly
      election.ranking()[0] = ['c']
    }).toThrow(TypeError)
    // @ts-expect-error steps are readonly
    expect(() => election.result().steps.pop()).toThrow(TypeError)
    expect(election.result()).toStrictEqual(result)
  })

  it('keeps the random draws', () => {
    for (const method of [
      new RandomCandidates({ candidates, rng: rngGenerator('readonly') }),
      new RandomDictator({
        candidates,
        ballots,
        rng: rngGenerator('readonly'),
      }),
    ]) {
      const ranking = structuredClone(method.ranking())
      expect(() => {
        // @ts-expect-error the ranking is readonly
        method.ranking()[0] = ['zz']
      }).toThrow(TypeError)
      expect(method.ranking()).toStrictEqual(ranking)
    }
  })

  it('keeps the judgements and candidates', () => {
    const mj = new MajorityJudgment({ candidates, ballots })
    const ranking = mj.ranking()
    expect(() => {
      // @ts-expect-error judgements are readonly
      mj.judgements().a[0] = 99
    }).toThrow(TypeError)
    expect(() => {
      // @ts-expect-error candidates are readonly
      mj.candidates.push('zz')
    }).toThrow(TypeError)
    expect(mj.judgements().a?.[0]).toBe(4)
    expect(mj.ranking()).toStrictEqual(ranking)
  })

  it('gives a fresh ranking each call when nothing caches it', () => {
    const borda = new Borda({ candidates, ballots })
    // @ts-expect-error the ranking is readonly
    borda.ranking()[0] = ['c']
    expect(borda.ranking()).toStrictEqual([['b'], ['a'], ['c']])
  })

  it('copies a matrix input', () => {
    const array = [
      [0, 2, 1],
      [1, 0, 2],
      [2, 1, 0],
    ]
    const copeland = new Copeland({ candidates, array })
    const scores = copeland.scores()
    array[0] = [0, 9, 9]
    expect(copeland.scores()).toStrictEqual(scores)
    expect(() => {
      // @ts-expect-error the matrix is readonly
      copeland.matrix.array[0][1] = 9
    }).toThrow(TypeError)
  })
})
