import { isDeepStrictEqual } from 'node:util'
import {
  AntiPlurality,
  Approval,
  Baldwin,
  Benham,
  Black,
  Borda,
  BottomTwoRunoff,
  Bucklin,
  condorcetWinner,
  Coombs,
  Copeland,
  FirstPastThePost,
  InstantRunoff,
  Kemeny,
  MajorityJudgment,
  MaximalLotteries,
  Minimax,
  MinimaxTD,
  MinimaxVariant,
  Nanson,
  RandomDictator,
  RandomizedCondorcet,
  RankedPairs,
  Schulze,
  Smith,
  SmithInstantRunoff,
  smithSet,
  SplitCycle,
  StableVoting,
  type Strength,
  SupplementaryVote,
  TidemanAlternative,
  TwoRoundRunoff,
  Woodall,
} from '.'
import * as R from './test/reference'
import { rngGenerator } from './utils'

// Differential checks: each method against an implementation written from its
// definition (`./test/reference.ts`), on random profiles of 3 to 6 candidates:
// default options on strict and tied ones, random ones on optioned ones.
const PROFILES = 250

const generate = R.profileGenerator(rngGenerator('reference'))
const sizes = Array.from({ length: PROFILES }, () => ({
  n: 3 + generate.int(4),
  voters: 1 + generate.int(12),
}))
const profiles = {
  strict: sizes.map(({ n, voters }) => generate.strict(n, voters)),
  tied: sizes.map(({ n, voters }) => generate.tied(n, voters)),
  optioned: sizes.map(({ n, voters }) => generate.optioned(n, voters)),
}
const kinds = ['strict', 'tied', 'optioned'] as const

type Profile = R.RefProfile
type Scores = Record<string, number>

const M = (p: Profile) => R.pairwise(p)
const sorted = (xs: readonly string[]) =>
  xs.toSorted((x, y) => x.localeCompare(y)).join(',')
const canon = (ranking: readonly (readonly string[])[]) =>
  ranking.map((tier) => sorted(tier))
const first = (ranking: readonly (readonly string[])[]) =>
  sorted(ranking[0] ?? [])
// Scores rounded, so float noise does not count as a mismatch.
const round = (scores: Readonly<Scores>) =>
  Object.fromEntries(
    Object.entries(scores)
      .toSorted(([x], [y]) => x.localeCompare(y))
      .map(([c, s]) => [c, Math.round(s * 1e6) / 1e6 + 0]),
  )

// The profiles on which the library and the reference disagree.
const mismatches = <T>(
  ps: Profile[],
  lib: (p: Profile) => T,
  ref: (p: Profile) => T,
) =>
  ps.flatMap((profile) => {
    const out = { lib: lib(profile), ref: ref(profile) }
    return isDeepStrictEqual(out.lib, out.ref) ? [] : { profile, ...out }
  })

describe.each(kinds)('on %s profiles', (kind) => {
  const ps = profiles[kind]

  it.each<Strength>(['winning-votes', 'margins'])('Schulze %s', (strength) => {
    expect(
      mismatches(
        ps,
        (p) => canon(new Schulze({ ...p, strength }).ranking()),
        (p) => canon(R.schulze(p.candidates, M(p), strength)),
      ),
    ).toEqual([])
  })

  it.each<Strength>(['winning-votes', 'margins'])(
    'RankedPairs %s',
    (strength) => {
      expect(
        mismatches(
          ps,
          (p) => canon(new RankedPairs({ ...p, strength }).ranking()),
          (p) => canon(R.rankedPairs(p.candidates, M(p), strength)),
        ),
      ).toEqual([])
    },
  )

  it('Kemeny', () => {
    expect(
      mismatches(
        ps,
        (p) => round(new Kemeny(p).scores()),
        (p) => round(R.kemenyScores(p.candidates, M(p))),
      ),
    ).toEqual([])
  })

  it('SplitCycle', () => {
    expect(
      mismatches(
        ps,
        (p) => canon(new SplitCycle(p).ranking()),
        (p) => canon(R.splitCycle(p.candidates, M(p))),
      ),
    ).toEqual([])
  })

  it('StableVoting', () => {
    expect(
      mismatches(
        ps,
        (p) => canon(new StableVoting(p).ranking()),
        (p) => canon(R.stableVoting(p.candidates, M(p))),
      ),
    ).toEqual([])
  })

  it('Copeland', () => {
    expect(
      mismatches(
        ps,
        (p) => round(new Copeland(p).scores()),
        (p) => round(R.copelandScores(p.candidates, M(p))),
      ),
    ).toEqual([])
  })

  it.each(
    Object.values(MinimaxVariant).flatMap((variant) =>
      [false, true].map((excludeTies) => ({ variant, excludeTies })),
    ),
  )('Minimax $variant, excludeTies $excludeTies', (options) => {
    expect(
      mismatches(
        ps,
        (p) => round(new Minimax({ ...p, ...options }).scores()),
        (p) =>
          round(
            R.minimaxScores(
              p.candidates,
              M(p),
              options.variant,
              options.excludeTies,
            ),
          ),
      ),
    ).toEqual([])
  })

  it('smithSet', () => {
    expect(
      mismatches(
        ps,
        (p) => sorted(smithSet(p)),
        (p) => sorted(R.smith(p.candidates, M(p))),
      ),
    ).toEqual([])
  })

  it('condorcetWinner', () => {
    expect(
      mismatches(
        ps,
        (p) => condorcetWinner(p),
        (p) => R.condorcet(p.candidates, M(p)),
      ),
    ).toEqual([])
  })

  it('FirstPastThePost', () => {
    expect(
      mismatches(
        ps,
        (p) => round(new FirstPastThePost(p).scores()),
        (p) => round(R.fptpScores(p)),
      ),
    ).toEqual([])
  })

  it('Approval', () => {
    expect(
      mismatches(
        ps,
        (p) => round(new Approval(p).scores()),
        (p) => round(R.approvalScores(p)),
      ),
    ).toEqual([])
  })

  it('Borda', () => {
    expect(
      mismatches(
        ps,
        (p) => round(new Borda(p).scores()),
        (p) => round(R.bordaScores(p)),
      ),
    ).toEqual([])
  })

  it('AntiPlurality', () => {
    expect(
      mismatches(
        ps,
        (p) => round(new AntiPlurality(p).scores()),
        (p) => round(R.antiPluralityScores(p)),
      ),
    ).toEqual([])
  })

  it('Bucklin', () => {
    expect(
      mismatches(
        ps,
        (p) => round(new Bucklin(p).scores()),
        (p) => round(R.bucklinScores(p)),
      ),
    ).toEqual([])
  })

  // The Condorcet winner, else the Borda winners.
  it('Black', () => {
    expect(
      mismatches(
        ps,
        (p) => first(new Black(p).ranking()),
        (p) => {
          const winner = R.condorcet(p.candidates, M(p))
          if (winner !== undefined) return winner
          const s = R.bordaScores(p)
          const best = Math.max(...Object.values(s))
          return sorted(p.candidates.filter((c) => s[c] === best))
        },
      ),
    ).toEqual([])
  })

  it('Smith-efficient methods elect within the Smith set', () => {
    const methods = [
      Schulze,
      RankedPairs,
      SplitCycle,
      StableVoting,
      Kemeny,
      Copeland,
      MinimaxTD,
      Smith,
      Nanson,
      Baldwin,
      SmithInstantRunoff,
      Woodall,
      TidemanAlternative,
    ]
    expect(
      mismatches(
        ps,
        (p) => {
          const S = R.smith(p.candidates, M(p))
          return methods
            .filter((Method) =>
              (new Method(p).ranking()[0] ?? []).some((c) => !S.includes(c)),
            )
            .map((Method) => Method.label)
        },
        () => [],
      ),
    ).toEqual([])
  })

  // Each lottery p is optimal: p·M ≥ 0 on the margins, or their signs.
  it.each([
    { Method: MaximalLotteries, sign: false },
    { Method: RandomizedCondorcet, sign: true },
  ])('$Method.label is optimal', ({ Method, sign }) => {
    expect(
      mismatches(
        ps,
        (p) => {
          const N = M(p)
          const probabilities = new Method(p).probabilities()
          const q = p.candidates.map((c) => probabilities[c] ?? NaN)
          const margin = (i: number, j: number) => {
            const m = N[i]![j]! - N[j]![i]!
            return sign ? Math.sign(m) : m
          }
          const worst = Math.min(
            ...q.map((_, j) => q.reduce((a, x, i) => a + x * margin(i, j), 0)),
          )
          return {
            sum: Math.round(q.reduce((a, b) => a + b, 0) * 1e9) / 1e9,
            positive: q.every((x) => x > -1e-12),
            optimal: worst > -1e-9,
          }
        },
        () => ({ sum: 1, positive: true, optimal: true }),
      ),
    ).toEqual([])
  })
})

// Grades on whole weights, as the majority value counts votes: the optioned
// profiles, weights doubled and rounded.
describe('MajorityJudgment', () => {
  const ps = profiles.optioned.map((p) => ({
    ...p,
    ballots: p.ballots.map((b) => ({ ...b, weight: Math.round(b.weight * 2) })),
  }))

  it.each([
    {},
    { grades: 8 },
    { grades: 3, clampGrades: true },
    { grades: 1, clampGrades: true },
  ])('%o', (options) => {
    expect(
      mismatches(
        [...profiles.strict, ...profiles.tied, ...ps],
        (p) => canon(new MajorityJudgment({ ...p, ...options }).ranking()),
        (p) => canon(R.majorityJudgment(p, options)),
      ),
    ).toEqual([])
  })
})

// The winners: for round methods, those who win in some order of breaking the
// ties that decide it.
const winners: [
  string,
  (p: Profile) => readonly (readonly string[])[],
  (p: Profile) => string[],
][] = [
  ['InstantRunoff', (p) => new InstantRunoff(p).ranking(), R.irv],
  ['Benham', (p) => new Benham(p).ranking(), R.benham],
  ['Woodall', (p) => new Woodall(p).ranking(), R.woodall],
  [
    'SmithInstantRunoff',
    (p) => new SmithInstantRunoff(p).ranking(),
    R.smithIrv,
  ],
  [
    'TidemanAlternative smith',
    (p) => new TidemanAlternative(p).ranking(),
    (p) => R.tideman(p, 'smith'),
  ],
  [
    'TidemanAlternative schwartz',
    (p) => new TidemanAlternative({ ...p, topSet: 'schwartz' }).ranking(),
    (p) => R.tideman(p, 'schwartz'),
  ],
  ['Coombs', (p) => new Coombs(p).ranking(), R.coombs],
  ['Baldwin', (p) => new Baldwin(p).ranking(), R.baldwin],
  ['Nanson', (p) => new Nanson(p).ranking(), R.nanson],
  ['Bucklin', (p) => new Bucklin(p).ranking(), R.bucklin],
  ['TwoRoundRunoff', (p) => new TwoRoundRunoff(p).ranking(), R.twoRound],
  [
    'SupplementaryVote',
    (p) => new SupplementaryVote(p).ranking(),
    (p) => R.supplementary(p, 2),
  ],
  [
    'SupplementaryVote, 1 preference',
    (p) => new SupplementaryVote({ ...p, preferences: 1 }).ranking(),
    (p) => R.supplementary(p, 1),
  ],
  [
    'SupplementaryVote, 3 preferences',
    (p) => new SupplementaryVote({ ...p, preferences: 3 }).ranking(),
    (p) => R.supplementary(p, 3),
  ],
  ['BottomTwoRunoff', (p) => new BottomTwoRunoff(p).ranking(), R.bottomTwo],
]

describe.each(kinds)('winners on %s profiles', (kind) => {
  it.each(winners)('%s', (_, lib, ref) => {
    expect(
      mismatches(
        profiles[kind],
        (p) => first(lib(p)),
        (p) => sorted(ref(p)),
      ),
    ).toEqual([])
  })
})

describe('winners on strict profiles', () => {
  it('RandomDictator', () => {
    expect(
      mismatches(
        profiles.strict,
        (p) => round(new RandomDictator(p).probabilities()),
        (p) => {
          const s = Object.fromEntries(p.candidates.map((c) => [c, 0]))
          const total = p.ballots.reduce((a, b) => a + b.weight, 0)
          for (const b of p.ballots) s[b.ranking[0]![0]!]! += b.weight / total
          return round(s)
        },
      ),
    ).toEqual([])
  })
})
