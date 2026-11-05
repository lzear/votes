import {
  Borda,
  CandidateOrder,
  Election,
  InstantRunoff,
  methods,
  type Profile,
  type Ranker,
  VotingSystem,
} from '.'
import { abcde } from './test/test-utils'
import {
  condorcetWinner,
  matrixFromBallots,
  rngGenerator,
  smithSet,
  totalBallotsWeight,
} from './utils'
import { canonizeRanking } from './utils/normalize'
import { shuffleArray } from './utils/shuffle-array'

// Methods a Condorcet winner always wins.
const condorcet = [
  VotingSystem.Baldwin,
  VotingSystem.Benham,
  VotingSystem.Black,
  VotingSystem.Copeland,
  VotingSystem.Kemeny,
  VotingSystem.MaximalLotteries,
  VotingSystem.Minimax,
  VotingSystem.MinimaxTD,
  VotingSystem.Nanson,
  VotingSystem.RandomizedCondorcet,
  VotingSystem.RankedPairs,
  VotingSystem.Schulze,
  VotingSystem.Smith,
  VotingSystem.SmithInstantRunoff,
  VotingSystem.SplitCycle,
  VotingSystem.StableVoting,
  VotingSystem.TidemanAlternative,
  VotingSystem.Woodall,
]

const systems = Object.values(VotingSystem)

// Partial ballots with ties on 3 to 5 candidates, every other profile leaving
// unranked candidates out.
const rng = rngGenerator('invariants')
const pick = (n: number) => Math.floor(rng() * n)
const profiles = Array.from({ length: 200 }, (_, i) => {
  const candidates = abcde.slice(0, 3 + (i % 3))
  const ballots = Array.from({ length: 1 + pick(8) }, () => {
    const ranking: (typeof candidates)[number][][] = []
    const ranked = shuffleArray(candidates, rng).slice(
      0,
      1 + pick(candidates.length),
    )
    for (const c of ranked) {
      const tier = ranking.at(-1)
      if (tier && rng() < 0.25) tier.push(c)
      else ranking.push([c])
    }
    return { ranking, weight: 1 + pick(4) }
  })
  return { candidates, ballots, unrankedLast: i % 2 === 0 }
})

type RandomProfile = (typeof profiles)[number]

const run = (system: VotingSystem, profile: Profile<string>): Ranker<string> =>
  new methods[system]({ ...profile, rng: rngGenerator(system) })

// Each profile's ranking, ties sorted: one `expect`, its diff indexing the
// profiles that fail.
const rankings = (
  rank: (profile: RandomProfile, i: number) => Ranker<string>,
) => profiles.map((p, i) => canonizeRanking(rank(p, i).ranking()))

const condorcetWinners = profiles.flatMap((profile) => {
  const [winner, ...others] = smithSet(profile)
  return others.length > 0 ? [] : { profile, winner }
})

const election = (profile: RandomProfile) =>
  new Election({ ...profile, methods: [InstantRunoff, Borda, CandidateOrder] })

describe('invariants on random profiles', () => {
  // Random methods draw in candidate order.
  it.each(
    systems.filter(
      (s) => !methods[s].isRandom && s !== VotingSystem.CandidateOrder,
    ),
  )('ranks the same in any candidate order (%s)', (system) => {
    const shuffle = rngGenerator(system)
    expect(
      rankings((p) =>
        run(system, {
          ...p,
          candidates: shuffleArray(p.candidates, shuffle),
        }),
      ),
    ).toStrictEqual(rankings((p) => run(system, p)))
  })

  it.each(condorcet)('ranks a Condorcet winner alone first (%s)', (system) => {
    expect(
      condorcetWinners.map(({ profile }) => run(system, profile).ranking()[0]),
    ).toStrictEqual(condorcetWinners.map(({ winner }) => [winner]))
  })

  // Majority judgment's majority value counts whole votes.
  it.each(systems.filter((s) => s !== VotingSystem.MajorityJudgment))(
    'ranks weights ÷ 10 like whole ones (%s)',
    (system) => {
      expect(
        rankings((p) =>
          run(system, {
            ...p,
            ballots: p.ballots.map((b) => ({ ...b, weight: b.weight / 10 })),
          }),
        ),
      ).toStrictEqual(rankings((p) => run(system, p)))
    },
  )

  it.each(systems)('ranks as restricted to all candidates (%s)', (system) => {
    expect(
      rankings((p) => run(system, p).restrict(p.candidates)),
    ).toStrictEqual(rankings((p) => run(system, p)))
  })

  // Majority judgment keeps its grades; candidate order, its order.
  it.each(
    systems.filter(
      (s) =>
        !methods[s].isRandom &&
        s !== VotingSystem.CandidateOrder &&
        s !== VotingSystem.MajorityJudgment,
    ),
  )('ranks as a fresh run on a random subset (%s)', (system) => {
    const subset = rngGenerator(system)
    const subsets = profiles.map(({ candidates }) =>
      shuffleArray(candidates, subset).slice(
        0,
        1 + Math.floor(subset() * candidates.length),
      ),
    )
    expect(
      rankings((p, i) => run(system, p).restrict(subsets[i]!)),
    ).toStrictEqual(
      rankings((p, i) => run(system, { ...p, candidates: subsets[i]! })),
    )
  })

  it('ranks as restricted to all candidates (Election)', () => {
    expect(rankings((p) => election(p).restrict(p.candidates))).toStrictEqual(
      rankings(election),
    )
  })
})

// Names that object keys reorder or inherit, integer-like ones first, sorted
// as a to e are: maximal lotteries pick among several by name.
const rename = Object.fromEntries(
  abcde.map((c, i) => [c, ['10', '2', '__proto__', 'b c', 'constructor'][i]!]),
)
const renamed = (profile: RandomProfile) => ({
  ...profile,
  candidates: profile.candidates.map((c) => rename[c]!),
  ballots: profile.ballots.map((b) => ({
    ...b,
    ranking: b.ranking.map((tier) => tier.map((c) => rename[c]!)),
  })),
})

// Each profile's ranking, or for a random method its chances, rounded: a draw
// reads the ballots in order.
const outcomes = (system: VotingSystem, change: (p: RandomProfile) => object) =>
  profiles.map((p) => {
    const method = run(system, { ...p, ...change(p) })
    return method.probabilities
      ? Object.entries(method.probabilities()).map(
          ([c, x]) => [c, Math.round(x * 1e9)] as const,
        )
      : canonizeRanking(method.ranking())
  })

describe('invariants on random profiles, ballots changed', () => {
  // Dictator reads the ballots in order.
  it.each(systems.filter((s) => s !== VotingSystem.Dictator))(
    'ranks the same in any ballot order (%s)',
    (system) => {
      const shuffle = rngGenerator(system)
      expect(
        outcomes(system, (p) => ({
          ballots: shuffleArray(p.ballots, shuffle),
        })),
      ).toStrictEqual(outcomes(system, () => ({})))
    },
  )

  it.each(systems)('ranks renamed candidates alike (%s)', (system) => {
    expect(rankings((p) => run(system, renamed(p)))).toStrictEqual(
      rankings((p) => run(system, p)).map((ranking) =>
        canonizeRanking(ranking.map((tier) => tier.map((c) => rename[c]!))),
      ),
    )
  })

  it.each(systems)('ranks weights × 3 like whole ones (%s)', (system) => {
    expect(
      rankings((p) =>
        run(system, {
          ...p,
          ballots: p.ballots.map((b) => ({ ...b, weight: b.weight * 3 })),
        }),
      ),
    ).toStrictEqual(rankings((p) => run(system, p)))
  })

  // Each ballot of weight w as w ballots of weight 1, next to each other.
  it.each(systems)('ranks split ballots like weighted ones (%s)', (system) => {
    expect(
      outcomes(system, (p) => ({
        ballots: p.ballots.flatMap((b) =>
          Array.from({ length: b.weight }, () => ({ ...b, weight: 1 })),
        ),
      })),
    ).toStrictEqual(outcomes(system, () => ({})))
  })

  it.each(systems)('ranks as without its zero weights (%s)', (system) => {
    expect(
      rankings((p) =>
        run(system, {
          ...p,
          ballots: p.ballots.flatMap((b) => [{ ...b, weight: 0 }, b]),
        }),
      ),
    ).toStrictEqual(rankings((p) => run(system, p)))
  })
})

// What lzear.org's comparison of the methods says each one meets
// (`method-criteria.ts` in its votes project). It has no verdict on candidate
// order or dictator, and a method it marks as meeting a criterion only in part
// stays out too: anti-plurality on Pareto, random dictator on consistency.
const except = (...left: VotingSystem[]) =>
  systems.filter(
    (s) =>
      s !== VotingSystem.CandidateOrder &&
      s !== VotingSystem.Dictator &&
      !left.includes(s),
  )

const majority = except(
  VotingSystem.AntiPlurality,
  VotingSystem.Borda,
  VotingSystem.RandomCandidates,
  VotingSystem.RandomDictator,
)

const condorcetLoser = except(
  VotingSystem.AntiPlurality,
  VotingSystem.Approval,
  VotingSystem.Bucklin,
  VotingSystem.FirstPastThePost,
  // The site says it meets this, but it can elect a Condorcet loser. With 25
  // voters on `dbca` ×1, `bdac` ×4, `abcd` ×3, `cbad` ×4, `adcb` ×4, `bacd` ×2,
  // `cdab` ×4 and `dabc` ×3, d loses each duel 12 to 13, yet its median rank
  // ties b's and it wins the tiebreak.
  VotingSystem.MajorityJudgment,
  VotingSystem.Minimax,
  VotingSystem.RandomCandidates,
  VotingSystem.RandomDictator,
  VotingSystem.SupplementaryVote,
)

const pareto = except(
  VotingSystem.AntiPlurality,
  VotingSystem.RandomCandidates,
  VotingSystem.Smith,
)

const smith = [
  VotingSystem.Baldwin,
  VotingSystem.Benham,
  VotingSystem.BottomTwoRunoff,
  VotingSystem.Copeland,
  VotingSystem.Kemeny,
  VotingSystem.MaximalLotteries,
  VotingSystem.MinimaxTD,
  VotingSystem.Nanson,
  VotingSystem.RandomizedCondorcet,
  VotingSystem.RankedPairs,
  VotingSystem.Schulze,
  VotingSystem.Smith,
  VotingSystem.SmithInstantRunoff,
  VotingSystem.SplitCycle,
  VotingSystem.StableVoting,
  VotingSystem.TidemanAlternative,
  VotingSystem.Woodall,
]

const monotonic = [
  VotingSystem.AbsoluteMajority,
  VotingSystem.AntiPlurality,
  VotingSystem.Approval,
  VotingSystem.Black,
  VotingSystem.Borda,
  VotingSystem.Bucklin,
  VotingSystem.Copeland,
  VotingSystem.FirstPastThePost,
  VotingSystem.Kemeny,
  VotingSystem.MajorityJudgment,
  VotingSystem.Minimax,
  VotingSystem.MinimaxTD,
  VotingSystem.RandomCandidates,
  VotingSystem.RandomDictator,
  VotingSystem.RandomizedCondorcet,
  VotingSystem.RankedPairs,
  VotingSystem.Schulze,
  VotingSystem.Smith,
  VotingSystem.SplitCycle,
]

const consistent = [
  VotingSystem.AbsoluteMajority,
  VotingSystem.AntiPlurality,
  VotingSystem.Approval,
  VotingSystem.Borda,
  VotingSystem.FirstPastThePost,
  VotingSystem.MaximalLotteries,
  VotingSystem.RandomCandidates,
]

// Full rankings, as the site reads these criteria. An odd number of ballots of
// odd weights leaves no duel tied, and weights up to 99 rarely tie anything
// else: a tie would test the tiebreak rather than the method. Majority
// judgment's time grows with the weights.
const decided = Array.from({ length: 200 }, (_, i) => {
  const candidates = abcde.slice(0, 3 + (i % 3))
  const ballots = Array.from({ length: 5 + 2 * pick(3) }, () => ({
    ranking: shuffleArray(candidates, rng).map((c) => [c]),
    weight: 1 + 2 * pick(50),
  }))
  return { candidates, ballots }
})

type DecidedProfile = (typeof decided)[number]

// The candidates who can win, with their chances in `SURE`ths: all of it for
// each winner of a method that draws nothing.
const SURE = 1e7
const lottery = (
  system: VotingSystem,
  profile: DecidedProfile,
): Record<string, number> => {
  const method = run(system, profile)
  if (method.probabilities) {
    const chances = method.probabilities()
    return Object.fromEntries(
      profile.candidates.flatMap((c) =>
        chances[c]! > 1 / SURE ? [[c, Math.round(chances[c]! * SURE)]] : [],
      ),
    )
  }
  const ranking = method.ranking()
  // Absolute majority ties everyone when no one has a majority: no winner.
  const first =
    system === VotingSystem.AbsoluteMajority && ranking.length === 1
      ? []
      : ranking[0]!
  return Object.fromEntries(
    profile.candidates.filter((c) => first.includes(c)).map((c) => [c, SURE]),
  )
}

const winners = (system: VotingSystem, profile: DecidedProfile) =>
  Object.keys(lottery(system, profile))

const majorityWinners = decided.flatMap((profile) => {
  const winner = profile.candidates.find(
    (c) =>
      2 *
        totalBallotsWeight(
          profile.ballots.filter((b) => b.ranking[0]![0] === c),
        ) >
      totalBallotsWeight(profile.ballots),
  )
  return winner ? { profile, winner } : []
})

// A candidate who should not win: one losing every duel, the winner of them
// all once the ballots are reversed.
const condorcetLosers = decided.flatMap((profile) => {
  const loser = condorcetWinner({
    candidates: profile.candidates,
    ballots: profile.ballots.map((b) => ({
      ...b,
      ranking: b.ranking.toReversed(),
    })),
  })
  return loser ? { profile, loser } : []
})

// Likewise: `loser` swapped below `x` on every ballot ranking it higher.
const dominated = decided.map((profile) => {
  const [x, loser] = shuffleArray(profile.candidates, rng) as [
    (typeof abcde)[number],
    (typeof abcde)[number],
  ]
  return {
    loser,
    profile: {
      ...profile,
      ballots: profile.ballots.map((b) => {
        const order = b.ranking.flat()
        const [i, j] = [order.indexOf(x), order.indexOf(loser)]
        return i < j
          ? b
          : { ...b, ranking: b.ranking.with(i, [loser]).with(j, [x]) }
      }),
    },
  }
})

const smithDominated = decided.flatMap((profile) => {
  const set = smithSet(profile)
  return set.length < profile.candidates.length ? { profile, set } : []
})

// `x` lifted one place on `count` voters of ballot `g`, unless it is first.
const raised = (
  profile: DecidedProfile,
  g: number,
  x: string,
  count: number,
): DecidedProfile | undefined => {
  const ballot = profile.ballots[g]!
  const i = ballot.ranking.findIndex(([c]) => c === x)
  if (i === 0) return undefined
  return {
    ...profile,
    ballots: [
      ...profile.ballots.with(g, { ...ballot, weight: ballot.weight - count }),
      {
        ranking: ballot.ranking.toSpliced(
          i - 1,
          2,
          ballot.ranking[i]!,
          ballot.ranking[i - 1]!,
        ),
        weight: count,
      },
    ],
  }
}

// Ranked pairs locks equal margins together, so a raise can change what they
// block: the site's verdict on it holds when every margin differs.
const distinctMargins = ({ ballots, candidates }: DecidedProfile) => {
  const { array } = matrixFromBallots(ballots, candidates)
  const margins = array.flatMap((row, i) =>
    row.flatMap((v, j) => (i < j ? Math.abs(v - array[j]![i]!) : [])),
  )
  return new Set(margins).size === margins.length
}

// Profiles on the same candidates, by index.
const sameCandidates = decided.flatMap((_, i) =>
  decided.flatMap((_b, j) =>
    j > i && (j - i) % 3 === 0 ? [[i, j] as const] : [],
  ),
)

describe('fairness criteria on random profiles', () => {
  it('finds profiles for each criterion', () => {
    for (const cases of [majorityWinners, condorcetLosers, smithDominated])
      expect(cases.length).toBeGreaterThan(50)
  })

  it.each(majority)('elects a majority winner (%s)', (system) => {
    expect(
      majorityWinners.map(({ profile }) => winners(system, profile)),
    ).toStrictEqual(majorityWinners.map(({ winner }) => [winner]))
  })

  it.each(condorcetLoser)('never elects a Condorcet loser (%s)', (system) => {
    expect(
      condorcetLosers.filter(({ profile, loser }) =>
        winners(system, profile).includes(loser),
      ),
    ).toStrictEqual([])
  })

  it.each(pareto)('never elects a candidate all rank lower (%s)', (system) => {
    expect(
      dominated.filter(({ profile, loser }) =>
        winners(system, profile).includes(loser),
      ),
    ).toStrictEqual([])
  })

  it.each(smith)('elects within the Smith set (%s)', (system) => {
    expect(
      smithDominated.filter(({ profile, set }) =>
        winners(system, profile).some(
          (c) => !set.includes(c as (typeof abcde)[number]),
        ),
      ),
    ).toStrictEqual([])
  })

  // A draw can only give a raised candidate better chances, give or take the
  // rounding.
  it.each(monotonic)('keeps a raised winner (%s)', (system) => {
    const count = rngGenerator(system)
    expect(
      decided.flatMap((profile) => {
        const before = lottery(system, profile)
        return Object.keys(before).flatMap((x) =>
          profile.ballots.flatMap((b, g) => {
            const up = raised(profile, g, x, 1 + Math.floor(count() * b.weight))
            return up &&
              (lottery(system, up)[x] ?? 0) < before[x]! - 1 &&
              (system !== VotingSystem.RankedPairs ||
                (distinctMargins(profile) && distinctMargins(up)))
              ? { up, x }
              : []
          }),
        )
      }),
    ).toStrictEqual([])
  })

  it.each(consistent)('keeps what two electorates agree on (%s)', (system) => {
    const alone = decided.map((p) => JSON.stringify(lottery(system, p)))
    const agreeing = sameCandidates.filter(([i, j]) => alone[i] === alone[j])
    expect(agreeing.length).toBeGreaterThan(0)
    expect(
      agreeing.map(([i, j]) =>
        JSON.stringify(
          lottery(system, {
            ...decided[i]!,
            ballots: [...decided[i]!.ballots, ...decided[j]!.ballots],
          }),
        ),
      ),
    ).toStrictEqual(agreeing.map(([i]) => alone[i]))
  })
})
