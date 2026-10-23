import {
  Borda,
  CandidateOrder,
  Election,
  InstantRunoff,
  methods,
  type Ranker,
  VotingSystem,
} from '.'
import { abcde } from './test/test-utils'
import { rngGenerator, smithSet } from './utils'
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

const run = (system: VotingSystem, profile: RandomProfile) =>
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
