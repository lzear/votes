# votes

![version](https://img.shields.io/npm/v/votes)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/votes)
![language](https://img.shields.io/github/languages/top/lzear/votes)
![downloads](https://img.shields.io/npm/dm/votes)
![last commit](https://img.shields.io/github/last-commit/lzear/votes)
[![license](https://img.shields.io/github/license/lzear/votes)](https://github.com/lzear/votes/blob/main/LICENSE)
[![CI](https://github.com/lzear/votes/actions/workflows/ci.yml/badge.svg)](https://github.com/lzear/votes/actions/workflows/ci.yml)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Frank-votes.vercel.app%2F)](https://rank-votes.vercel.app/)

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
// { Bear: 10, Lion: 8, Sheep: 9 }

borda.ranking()
// [ ['Bear'], ['Sheep'], ['Lion'] ]
```

## Tiebreakers

Round-based methods (`InstantRunoff`, `Baldwin`, `Coombs`, `Nanson`, …) accept a
`tieBreakers` array. When multiple candidates tie for last place in a round,
tiebreakers are applied in order until one candidate can be singled out.

```typescript
import {
  InstantRunoff,
  Baldwin,
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
  ],
})
```

### `tb(Ctor, opts?)` options

| Option         | Default | Description                                                                                                                           |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `full`         | `false` | Run the tiebreaker on all candidates instead of the tied subset. Useful when a method's relative ranking is more meaningful globally. |
| `stable`       | `false` | After one pass, recurse into any remaining sub-ties until no further progress can be made.                                            |
| Any other prop | —       | Passed through to the method constructor (e.g. `rng` for random methods).                                                             |

Method type is auto-detected: matrix methods (`Copeland`, `Schulze`, …) receive
a pairwise matrix; ballot methods receive the filtered ballots; candidates-only
methods (`RandomCandidates`) receive just the candidate list.

### Round trace

`computeRounds()` returns detailed per-round results:

```typescript
const rounds = new InstantRunoff({
  candidates,
  ballots,
  tieBreakers: [Borda],
}).computeRounds()

rounds[0].roundResult
// {
//   scores:   { a: 5, b: 3, c: 3 },
//   qualified: ['a'],
//   eliminated: ['c'],          // resolved by tiebreaker
//   tieBreakSteps: [{
//     tbIndex: 0,               // first tiebreaker
//     tbName: 'Borda',
//     input: ['b', 'c'],        // tied candidates
//     ranking: [['b'], ['c']], // tiebreaker's verdict
//     resolved: ['b'],          // promoted out of tie
//     remaining: ['c'],         // eliminated
//   }]
// }
```

## Election: chaining rankers

`Election` chains pre-built ranker instances. The first provides the primary
ranking; subsequent rankers refine any remaining ties.

```typescript
import {
  Election,
  InstantRunoff,
  Schulze,
  matrixFromBallots,
  tb,
  Copeland,
} from 'votes'

const election = new Election({
  rankers: [
    new InstantRunoff({ candidates, ballots, tieBreakers: [tb(Copeland)] }),
    new Schulze(matrixFromBallots(ballots, candidates)),
  ],
})

election.ranking() // final ranking after all tie-breaking
election.result() // { ranking, steps: StepResult[] }
```

Each `StepResult` records `rankerName`, `before`, `after`, and optionally
`rounds` / `scores` from that step.

## Voting systems

| Method               | Class                 | Input              |
| -------------------- | --------------------- | ------------------ |
| Absolute majority    | `AbsoluteMajority`    | ballots            |
| Approval voting      | `Approbation`         | ballots            |
| Baldwin method       | `Baldwin`             | ballots            |
| Borda count          | `Borda`               | ballots            |
| Bottom-two-runoff    | `BottomTwoRunoff`     | ballots            |
| Coombs' method       | `Coombs`              | ballots            |
| Copeland's method    | `Copeland`            | matrix             |
| First-past-the-post  | `FirstPastThePost`    | ballots            |
| Instant-runoff (IRV) | `InstantRunoff`       | ballots            |
| Kemeny–Young         | `Kemeny`              | matrix             |
| Majority judgment    | `MajorityJudgment`    | ballots (6 grades) |
| Maximal lotteries    | `MaximalLotteries`    | matrix             |
| Minimax Condorcet    | `Minimax`             | matrix             |
| Minimax-TD           | `MinimaxTD`           | matrix             |
| Nanson method        | `Nanson`              | ballots            |
| Plurality (FPTP)     | `FirstPastThePost`    | ballots            |
| Random candidate     | `RandomCandidates`    | —                  |
| Random dictator      | `RandomDictator`      | ballots            |
| Randomized Condorcet | `RandomizedCondorcet` | matrix             |
| Ranked pairs         | `RankedPairs`         | matrix             |
| Schulze method       | `Schulze`             | matrix             |
| Smith's method       | `Smith`               | matrix             |
| Two-round runoff     | `TwoRoundRunoff`      | ballots            |

Matrix-input methods take the output of
`matrixFromBallots(ballots, candidates)`.

## Utilities

```typescript
import { matrixFromBallots, rngGenerator, tiebreak } from 'votes'

// Build a pairwise matrix from ballots
const matrix = matrixFromBallots(ballots, candidates)

// Seeded RNG for reproducible random methods
const rng = rngGenerator('my-seed')
new RandomCandidates({ candidates, rng })

// Functional tiebreaker helpers (for Election / custom use)
import { bordaTieBreaker, copelandTieBreaker, rngTieBreaker } from 'votes'
```

## Documentation

- Demo/Playground: [rank-votes.vercel.app](https://rank-votes.vercel.app/)
- Blog post:
  [Ranked voting systems](https://www.elzear.de/posts/2021-01-10-polls)
- API docs: [lzear.github.io/votes](https://lzear.github.io/votes/)
- Reference:
  [Comparison of electoral systems (Wikipedia)](https://en.wikipedia.org/wiki/Comparison_of_electoral_systems)

## Contributing

Contributions, issues and feature requests are welcome. Feel free to check the
[issues page](https://github.com/lzear/votes/issues).

The repository is split in 2 packages:

- `/votes` — NPM package source
  ([votes on npm](https://www.npmjs.com/package/votes))
