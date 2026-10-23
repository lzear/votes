# votes

[![version](https://img.shields.io/npm/v/votes)](https://www.npmjs.com/package/votes)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/votes)](https://bundlephobia.com/package/votes)
[![language](https://img.shields.io/github/languages/top/lzear/votes)](https://github.com/lzear/votes)
[![downloads](https://img.shields.io/npm/dm/votes)](https://www.npmjs.com/package/votes)
[![last commit](https://img.shields.io/github/last-commit/lzear/votes)](https://github.com/lzear/votes/commits/main)
[![license](https://img.shields.io/github/license/lzear/votes)](https://github.com/lzear/votes/blob/main/LICENSE)
[![CI](https://github.com/lzear/votes/actions/workflows/main.yml/badge.svg)](https://github.com/lzear/votes/actions/workflows/main.yml)
[![Codacy grade](https://app.codacy.com/project/badge/Grade/d2378c63d95f41efb79072176f015976)](https://app.codacy.com/gh/lzear/votes)
[![Codacy coverage](https://app.codacy.com/project/badge/Coverage/d2378c63d95f41efb79072176f015976)](https://app.codacy.com/gh/lzear/votes)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Flzear.org%2Fvotes)](https://lzear.org/votes)

TypeScript library of ranked voting methods, published to NPM.

## Install

```sh
yarn add votes
# or: npm install votes
```

## Basic usage

```typescript
import { Borda } from 'votes'

const borda = new Borda({
  candidates: ['Lion', 'Bear', 'Sheep'],
  ballots: [
    { ranking: [['Lion'], ['Bear'], ['Sheep']], weight: 4 },
    { ranking: [['Sheep'], ['Bear'], ['Lion']], weight: 3 },
    { ranking: [['Bear', 'Sheep'], ['Lion']], weight: 2 },
  ],
})

borda.scores()
// { Lion: 17, Bear: 19, Sheep: 18 }

borda.ranking()
// [ ['Bear'], ['Sheep'], ['Lion'] ]
```

A ballot ranks candidates in tiers: `[['Bear', 'Sheep'], ['Lion']]` means Bear
and Sheep tied first, Lion last. `weight` is how many voters cast that ballot
(default 1). Candidates a ballot leaves unranked join it as one tied bottom tier
by default; pass `unrankedLast: false` to score only expressed preferences
(unranked candidates then earn nothing from that ballot). Blank ballots, ranking
none of the candidates still in the race, don't count as cast; pass
`countBlank: true` to count them toward absolute majorities (`AbsoluteMajority`,
`Bucklin`, `Coombs`, `TwoRoundRunoff`, `SupplementaryVote`) and, with
`unrankedLast`, as worst grades in `MajorityJudgment`.

Every method takes this same `{ candidates, ballots, unrankedLast, countBlank }`
input. Matrix methods (see the table below) also take a pairwise matrix
`{ candidates, array }`, such as `matrixFromBallots(ballots, candidates)`.

Results are readonly. A method caches some of them, such as `rounds()` and
`Election#result()`, and freezes them, so copy a result before changing it:
`ranking().map((tier) => [...tier])`.

## Ties: chaining methods

`Election` chains methods on one input. The first ranks the candidates; each
next one re-ranks the tiers still tied. Round-based methods (`InstantRunoff` and
its Condorcet hybrids below, `Baldwin`, `Coombs`, `Nanson`, `TwoRoundRunoff`,
`SupplementaryVote`, `BottomTwoRunoff`) also break their round ties (for last
place, at two-round runoff's cut, or Nanson's complete tie) with the methods
after them, in order. A round tie they leave goes out at once if no order of it
changes the outcome; otherwise the count stops, and those who win in some order
of breaking the ties tie first. The search for them gives up after 10,000 sets
of candidates still in the race, or after 250,000 ballots read, since each set
reads every distinct ballot. The count then stops on everyone left. Alone, a
round method has no tiebreakers.

```typescript
import {
  Election,
  InstantRunoff,
  RandomCandidates,
  rngGenerator,
  Schulze,
} from 'votes'

const election = new Election({
  candidates,
  ballots,
  methods: [
    InstantRunoff,
    Schulze, // breaks IRV's round ties, then the ties left in its ranking
    RandomCandidates.with({ rng: rngGenerator('seed') }), // last resort
  ],
})

election.ranking() // final ranking after all tie-breaking
election.result() // { ranking, steps: StepResult[] }
```

Each `StepResult` records `name`, `before`, `after`, and `runs`: the method's
ranking of each tied tier, with its `scores` or `rounds`.

### `Method.with(options)`

| Option         | Default        | Description                                                                                                                                                        |
| -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mode`         | `'restricted'` | Which candidates the method ranks a tie among: the tied ones, everyone (`'full'`), or the tied ones, then each tie that leaves, until none splits (`'recursive'`). |
| `label`        | `Class.label`  | Name in traces (`TieBreakStep.name`, `StepResult.name`).                                                                                                           |
| Any other prop | —              | Passed through to the method constructor (e.g. `rng` for random methods).                                                                                          |

Among two tied candidates, most methods only count who more voters prefer;
`'full'` brings in how each fares against everyone:
`[InstantRunoff, FirstPastThePost.with({ mode: 'full' })]` breaks instant
runoff's ties by first-round votes.

### Round trace

`rounds()` returns detailed per-round results; in an `Election`, they are in the
round method's step:

```typescript
const [step] = new Election({
  candidates,
  ballots,
  methods: [InstantRunoff, Borda],
}).result().steps

const [round] = step.runs[0].rounds
// {
//   index: 0,
//   candidates: ['a', 'b', 'c'],
//   scores: { a: 5, b: 3, c: 3 },
//   qualified: ['a', 'b'],
//   eliminated: ['c'],          // resolved by tiebreaker
//   tieBreakSteps: [{
//     index: 0,                 // first tiebreaker
//     name: 'Borda',
//     candidates: ['b', 'c'],   // tied candidates
//     ranking: [['b'], ['c']],  // tiebreaker's verdict
//     scores: { b: 19, c: 14 }, // when the tiebreaker scores
//     resolved: ['b'],          // promoted out of tie
//     remaining: ['c'],         // eliminated
//   }]
// }
```

Some methods add method-specific detail as `info`: `Coombs` reports whether a
round was resolved by majority or elimination (`CoombsInfo`), `Nanson` reports
the Borda average used as elimination cutoff (`NansonInfo`).

## Iterated ranking

`ranking()` is each method's own full ranking. `iteratedRanking()` instead fills
places by repeated wins: run the method, take the winning tier, re-run the
method without the placed candidates, and so on. The two differ whenever a
method's full ranking disagrees with how it ranks subsets — e.g. instant runoff
orders losers by elimination time.

```typescript
const irv = new InstantRunoff({ candidates, ballots })
irv.ranking() // losers ordered by elimination time
irv.iteratedRanking() // 2nd place = winner of a re-run without the winner

new Election({ candidates, ballots, methods }).iteratedRanking() // re-runs the chain per place
```

Under the hood it uses `restrict(candidates)`, which every method exposes to
re-run itself on a subset of candidates, as if only they ran: a ballot ranking
none of them is blank. `MajorityJudgment` keeps its grades instead, as a grade
does not depend on who else runs; `CandidateOrder` keeps its order.

## Voting systems

| Method                | Class                 | Input             |
| --------------------- | --------------------- | ----------------- |
| Absolute majority     | `AbsoluteMajority`    | ballots           |
| Anti-plurality        | `AntiPlurality`       | ballots           |
| Approval voting       | `Approval`            | ballots           |
| Baldwin method        | `Baldwin`             | ballots           |
| Benham's method       | `Benham`              | ballots           |
| Black's method        | `Black`               | ballots           |
| Borda count           | `Borda`               | ballots           |
| Bottom-two-runoff     | `BottomTwoRunoff`     | ballots           |
| Bucklin voting        | `Bucklin`             | ballots           |
| Candidate order       | `CandidateOrder`      | —                 |
| Coombs' method        | `Coombs`              | ballots           |
| Copeland's method     | `Copeland`            | ballots or matrix |
| Dictator              | `Dictator`            | ballots           |
| First-past-the-post   | `FirstPastThePost`    | ballots           |
| Instant-runoff (IRV)  | `InstantRunoff`       | ballots           |
| Kemeny–Young ⚠️       | `Kemeny`              | ballots or matrix |
| Majority judgment     | `MajorityJudgment`    | ballots as grades |
| Maximal lotteries     | `MaximalLotteries`    | ballots or matrix |
| Minimax Condorcet     | `Minimax`             | ballots or matrix |
| Minimax-TD            | `MinimaxTD`           | ballots or matrix |
| Nanson method         | `Nanson`              | ballots           |
| Random candidate      | `RandomCandidates`    | —                 |
| Random dictator       | `RandomDictator`      | ballots           |
| Randomized Condorcet  | `RandomizedCondorcet` | ballots or matrix |
| Ranked pairs          | `RankedPairs`         | ballots or matrix |
| Schulze method        | `Schulze`             | ballots or matrix |
| Smith's method        | `Smith`               | ballots or matrix |
| Smith//IRV            | `SmithInstantRunoff`  | ballots           |
| Split Cycle           | `SplitCycle`          | ballots or matrix |
| Stable Voting ⚠️      | `StableVoting`        | ballots or matrix |
| Supplementary vote    | `SupplementaryVote`   | ballots           |
| Tideman's Alternative | `TidemanAlternative`  | ballots           |
| Two-round runoff      | `TwoRoundRunoff`      | ballots           |
| Woodall's method      | `Woodall`             | ballots           |

`methods` maps each `VotingSystem` id to its class:
`methods[VotingSystem.Borda]` is `Borda`.

`Approval` approves the candidates in each ballot's first tier.

`AbsoluteMajority` ranks everyone tied when no candidate has more than half the
ballots, for the next method in an `Election` to settle; its `winner()` is then
`undefined`.

`Bucklin` scores the count that finds a majority, a tier across its cut counting
for its share of places within; `counts()` lists each round's count.

`CandidateOrder` ranks candidates in the order given, whatever the order of a
tie it breaks, and `Dictator` as the first ballot, breaking its ties with the
next and so on: deterministic last resorts for an `Election`. `RandomDictator`
is `Dictator` on ballots drawn in random order, by weight.

`Baldwin` and `Nanson` take Borda scores from the pairwise matrix: the same as
`Borda`'s when ballots rank everyone, and a Condorcet winner always wins.

⚠️ `Kemeny` runs in O(n·2ⁿ) time and memory — slow beyond ~20 candidates, and
throws beyond `maxCandidates` (default 20, at most 30).

⚠️ `StableVoting` runs in exponential time at worst — seconds when majority
cycles span 20 candidates — and throws beyond `maxCandidates` (default 20, at
most 30). Below its winners, it ranks by running again without them;
`SplitCycle` ranks the undefeated first, then those only they defeat, and so on.

⚠️ `RandomDictator`'s `probabilities()` runs in exponential time on ballots with
ties. Each tie it explores reads every distinct ballot, and it throws past
`maxReads` ballots read after the first tie (default 2,000,000, about a second);
strict ballots explore the first tie alone. `ranking()` has no cap.

`MajorityJudgment` reads a ballot's tiers as grades, best first (`grades`,
default 6), and breaks ties one vote at a time: give it whole weights. A ballot
ranked past the last grade throws, or with `clampGrades` gives those ranks the
worst grade.

`Benham`, `Woodall`, `SmithInstantRunoff` (Smith//IRV) and `TidemanAlternative`
run instant runoff with a Condorcet check: Benham stops on a Condorcet winner
among those left, Woodall on the last member of the Smith set, Smith//IRV puts
everyone outside the Smith set out first, and Tideman's Alternative narrows to
the Smith set of those left before each count (`topSet: 'schwartz'` for the
Schwartz set). A round that narrows puts everyone else out at once.

`TwoRoundRunoff` counts the runoff from the ballots' whole rankings, as the
contingent vote does; `SupplementaryVote` counts only each ballot's first two
places (`preferences`, default 2), so `A > B > C` counts for neither in a C–D
runoff. The two agree when no ballot ranks past `preferences`.

`BottomTwoRunoff` settles each round with a first-choices head-to-head, the
first `tieBreakSteps` entry (named `FirstPastThePost`); the methods after it in
an `Election` apply only if that ties.

Random methods expose `probabilities()`, each candidate's chance to win, instead
of `scores()`, and draw their ranking once per instance.

`Schulze` also exposes `strengths()` — the beatpath strength matrix its scores
derive from.

`Minimax` also exposes `worstDefeats()`: each candidate's worst defeat and the
opponents inflicting it. It measures a defeat by its margin; pass `variant`
(`MinimaxVariant.WinningVotes` or `PairwiseOpposition`) to measure it otherwise,
and `excludeTies: true` to leave tied duels out.

`RankedPairs` and `Schulze` measure a pairwise win by the winner's votes by
default; pass `strength: 'margins'` to subtract the loser's. The two differ only
when voters tie both candidates or leave both unranked.

`RankedPairs` locks equal-strength pairs simultaneously by default (ties are
preserved rather than order-dependent). Pass `edgeSorter` — e.g. the exported
`byTotalParticipation` — to lock them in its order like canonical Tideman; pairs
it cannot tell apart still lock together. `lockSteps()` traces it: each group of
pairs, in order, each locked or skipped.

## Utilities

```typescript
matrixFromBallots(ballots, candidates) // array[i][j]: weight ranking i above j
makeAntisymmetric(matrix) // margins: array[i][j] - array[j][i]
smithSet({ candidates, ballots }) // smallest set beating everyone outside it
condorcetWinner({ candidates, ballots }) // who beats everyone else head-to-head, or undefined
toWeightedBallots([
  [['a'], ['b']],
  [['a'], ['b']],
]) // one ballot per ranking
groupBallots(ballots) // equal ballots merged, heaviest first
normalizeBallots(ballots, candidates) // unknown and repeated candidates dropped, unranked ones tied last
scoresToRanking({ a: 2, b: 1 }) // [['a'], ['b']]
rngGenerator('my-seed') // seeded RNG for random methods' `rng`
```

## Condorcet election format

Parse and serialize the
[Condorcet Election Format](https://github.com/CondorcetVote/CondorcetElectionFormat)
(`.cvotes` files):

```typescript
import {
  parseCondorcetElectionFormat,
  stringifyCondorcetElectionFormat,
} from 'votes'

const { candidates, ballots } = parseCondorcetElectionFormat(`
#/Candidates: A; B; C
A > B > C * 3
B > C > A * 2
`)

const text = stringifyCondorcetElectionFormat({ candidates, ballots })
```

## Documentation

- Demo: [lzear.org/votes](https://lzear.org/votes)
- API docs: [lzear.github.io/votes](https://lzear.github.io/votes/)
- Reference:
  [Comparison of electoral systems (Wikipedia)](https://en.wikipedia.org/wiki/Comparison_of_electoral_systems)

## Contributing

Contributions, issues and feature requests are welcome. Feel free to check the
[issues page](https://github.com/lzear/votes/issues).
