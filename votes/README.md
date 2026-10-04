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
(unranked candidates then earn nothing from that ballot).

Every method takes this same `{ candidates, ballots, unrankedLast }` input.
Matrix methods (see the table below) also take a pairwise matrix
`{ candidates, array }`, such as `matrixFromBallots(ballots, candidates)`.

## Tiebreakers

Round-based methods (`InstantRunoff`, `Baldwin`, `Coombs`, `Nanson`,
`TwoRoundRunoff`, `BottomTwoRunoff`) accept a `tieBreakers` array. When multiple
candidates tie for last place in a round, tiebreakers are applied in order until
one candidate can be singled out.

```typescript
import {
  InstantRunoff,
  RandomCandidates,
  Borda,
  Copeland,
  tb,
  rngGenerator,
} from 'votes'

// Simple: pass constructors directly
new InstantRunoff({ candidates, ballots, tieBreakers: [Borda, Copeland] })

// tb() lets you pass extra constructor options
const rng = rngGenerator('seed')
new InstantRunoff({
  candidates,
  ballots,
  tieBreakers: [
    Copeland, // first try Copeland
    tb(Borda, { full: true }), // run Borda on ALL candidates, not just the tied subset
    tb(Borda, { stable: true }), // recurse into sub-ties until stable
    tb(RandomCandidates, { rng }), // last resort: random with seeded RNG
  ],
})
```

### `tb(Ctor, opts?)` options

| Option         | Default    | Description                                                                                         |
| -------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `full`         | `false`    | Rank the tie by the method's ranking of all candidates instead of re-running it on the tied subset. |
| `stable`       | `false`    | After one pass, recurse into any remaining sub-ties until no further progress can be made.          |
| `label`        | class name | Name in traces (`TieBreakStep.name`, `StepResult.name`).                                            |
| Any other prop | —          | Passed through to the method constructor (e.g. `rng` for random methods).                           |

### Round trace

`rounds()` returns detailed per-round results:

```typescript
const rounds = new InstantRunoff({
  candidates,
  ballots,
  tieBreakers: [Borda],
}).rounds()

rounds[0]
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
//     resolved: ['b'],          // promoted out of tie
//     remaining: ['c'],         // eliminated
//   }]
// }
```

Some methods add method-specific detail as `info`: `Coombs` reports whether a
round was resolved by majority or elimination (`CoombsInfo`), `Nanson` reports
the Borda average used as elimination cutoff (`NansonInfo`).

## Election: chaining methods

`Election` chains methods on one input. The first ranks the candidates; each
next one re-ranks the tiers still tied, taking the same entries and `tb()`
options as `tieBreakers`.

```typescript
import { Election, InstantRunoff, RandomCandidates, Schulze, tb } from 'votes'

const election = new Election({
  candidates,
  ballots,
  methods: [InstantRunoff, Schulze, tb(RandomCandidates, { rng })],
})

election.ranking() // final ranking after all tie-breaking
election.result() // { ranking, steps: StepResult[] }
```

Each `StepResult` records `name`, `before`, `after`, and `runs`: the method's
ranking of each tied tier, with its `scores` or `rounds`.

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
re-run itself on a subset of candidates.

## Voting systems

| Method               | Class                 | Input             |
| -------------------- | --------------------- | ----------------- |
| Absolute majority    | `AbsoluteMajority`    | ballots           |
| Approval voting      | `Approval`            | ballots           |
| Baldwin method       | `Baldwin`             | ballots           |
| Borda count          | `Borda`               | ballots           |
| Bottom-two-runoff    | `BottomTwoRunoff`     | ballots           |
| Coombs' method       | `Coombs`              | ballots           |
| Copeland's method    | `Copeland`            | ballots or matrix |
| First-past-the-post  | `FirstPastThePost`    | ballots           |
| Instant-runoff (IRV) | `InstantRunoff`       | ballots           |
| Kemeny–Young ⚠️      | `Kemeny`              | ballots or matrix |
| Majority judgment    | `MajorityJudgment`    | ballots as grades |
| Maximal lotteries    | `MaximalLotteries`    | ballots or matrix |
| Minimax Condorcet    | `Minimax`             | ballots or matrix |
| Minimax-TD           | `MinimaxTD`           | ballots or matrix |
| Nanson method        | `Nanson`              | ballots           |
| Random candidate     | `RandomCandidates`    | —                 |
| Random dictator      | `RandomDictator`      | ballots           |
| Randomized Condorcet | `RandomizedCondorcet` | ballots or matrix |
| Ranked pairs         | `RankedPairs`         | ballots or matrix |
| Schulze method       | `Schulze`             | ballots or matrix |
| Smith's method       | `Smith`               | ballots or matrix |
| Two-round runoff     | `TwoRoundRunoff`      | ballots           |

`Approval` approves the candidates in each ballot's first tier.

`Baldwin` and `Nanson` take Borda scores from the pairwise matrix: the same as
`Borda`'s when ballots rank everyone, and a Condorcet winner always wins.

⚠️ `Kemeny` runs in O(n·2ⁿ) time and memory — slow beyond ~20 candidates.

`BottomTwoRunoff` always prepends `tb(FirstPastThePost)` to `tieBreakers` — that
FPTP step is the head-to-head runoff mechanism, not a fallback. It will appear
as the first entry in `tieBreakSteps`. User-supplied `tieBreakers` fire after it
only if the head-to-head itself ties.

Random methods expose `probabilities()`, each candidate's chance to win, instead
of `scores()`, and draw their ranking once per instance.

`Schulze` also exposes `strengths()` — the beatpath strength matrix its scores
derive from.

`RankedPairs` locks equal-strength pairs simultaneously by default (ties are
preserved rather than order-dependent). Pass `edgeSorter` — e.g. the exported
`byTotalParticipation` — to lock them in its order like canonical Tideman; pairs
it cannot tell apart still lock together.

Every method also exposes `deTie()`, which recursively resolves ties by
re-running the same method on each tied subset:

```typescript
new Borda({ candidates, ballots }).deTie()
// ranking(), each tie re-ranked by Borda on it, until no tie splits further
```

## Utilities

```typescript
matrixFromBallots(ballots, candidates) // array[i][j]: weight ranking i above j
makeAntisymmetric(matrix) // margins: array[i][j] - array[j][i]
smithSet({ candidates, ballots }) // smallest set beating everyone outside it
toWeightedBallots([
  [['a'], ['b']],
  [['a'], ['b']],
]) // one ballot per ranking
groupBallots(ballots) // equal ballots merged, heaviest first
normalizeBallots(ballots, candidates) // unknown and repeated candidates dropped
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
