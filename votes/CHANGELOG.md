# votes

## 4.0.0

### Major Changes

- 22e91ec: `VotingSystem` and `MinimaxVariant` are `as const` objects, no longer
  enums.
- af1be8f: Refactor everything. New API. Main changes:

  - Remove external dependency `javascript-lp-solver`.
  - Implement tie-breaking mechanism.
  - New `Election` class to chain rankers together.
  - New `unrankedLast` option on ballot methods: by default unranked candidates
    join a ballot as one tied bottom tier; pass `false` to score only expressed
    preferences.
  - Round-based methods report per-round details: scores, tie-break steps, and
    method-specific `info` (`CoombsInfo`, `NansonInfo`).
  - Round-method `ranking()` now includes the winners tier.
  - New `Schulze#strengths()` exposing the beatpath strength matrix.
  - New `iteratedRanking()` on all methods and `Election`: fill each place by
    re-running the full method without the already-placed candidates, instead of
    using the method's own full ranking. `restrict()` is now public, and the
    `iterateRanking` helper is exported under `utils`.
  - Ranked pairs: fix infinite recursion on raw win-count matrices with wide
    ties.

### Minor Changes

- a2bd9c4: Export the `ElectionResult` type.
- 2b48088: Majority judgment takes a `grades` option (default 6) and throws on a
  grade past it.
- 0003fb4: Majority judgment gives the worst grade to candidates a ballot leaves
  out, unless `unrankedLast: false`.

### Patch Changes

- f80a831: The Condorcet format parser reads `*` and `^` without spaces around
  them.
- f80a831: The Condorcet format writer throws on names with reserved characters.
- 9d02893: Coombs with `unrankedLast: false` takes last choices only from
  ballots that rank everyone left.
- 4ba635c: Random dictator ranks the candidates its ballot leaves out last.
- 864b7fc: Drop the lodash-es dependency.
- 7b4c5d5: Faster bottom-two runoff head-to-head.
- 7b4c5d5: Faster Baldwin and Nanson.
- 7b4c5d5: Faster instant runoff, Coombs and bottom-two runoff.
- 5de37cf: Normalize ballots in one pass.
- 6fbf324: Kemeny runs in O(n·2ⁿ), not O(n!), and averages scores over its best
  orders.
- 0275d8e: Maximal lotteries and randomized Condorcet never draw a candidate of
  probability 0.
- 6eed0be: Performance and packaging improvements:

  - `matrixFromBallots` now indexes candidates with a `Map` and tracks unranked
    candidates with a `Set` (was O(ballots × candidates²)).
  - New `pairwiseMatrix` utility; Copeland and Schulze share it.
  - Simplify Ranked pairs winner detection (removes dead score bookkeeping).
  - `package.json` `exports` now declares explicit `types` conditions.
  - Remove the `utils.Edge` re-export; use `RankedPairsEdge` from the package
    root instead.

- 8bc6ea1: Pairwise matrices honor `unrankedLast: false`.
- 3812fd3: Majority judgment follows Balinski–Laraki: lower median, ties broken
  by majority value.
- e740336: Majority judgment grades a candidate once per ballot.
- 81be7a3: Stop publishing test files.
- 0a7b044: Ranked pairs no longer locks pairwise defeats.
- 0ac9082: Schulze ties candidates neither of whom beats the other.
- 422b5cf: Scores within the tie tolerance, or both infinite, tie whatever the
  candidate order.

## 3.0.0

### Major Changes

- 63568c3: Update `lodash` to `lodash-es`. Change the package to be ESM by
  default.

## 2.2.2

### Patch Changes

- 91eeb7a: Update some dependencies

## 2.2.1

### Patch Changes

- 6012713: Add exports to package.json Fixing
  https://github.com/lzear/votes/issues/107

## 2.2.0

### Minor Changes

- 1165f3e: **Fix the LP solver used in Randomized Condorcet and Maximal
  Lotteries.**

  The methods should still be tested more deeply, but at least they should be
  less buggy now. Their warnings and deprecation notices are removed with this
  release.

## 2.1.1

### Patch Changes

- 674d485: Add IIFE bundle

## 2.1.0

### Minor Changes

- b71fa6f: Reduce bundle size by using tsup

## 2.0.6

### Patch Changes

- c30f99b: Add Minimax-TD

## 2.0.5

### Patch Changes

- 04ba095: Remove `array.at` from the codebase

## 2.0.4

### Patch Changes

- 9c462a6: Add utils to categorise methods (random, needs ballots, needs matrix)

## 2.0.3

### Patch Changes

- Add the
  [variants for Minimax Condorcet](https://en.wikipedia.org/wiki/Minimax_Condorcet_method#Variants_of_the_pairwise_score)

## 2.0.2

### Major Changes

- ## Complete refactor of `votes`

  The old functions were getting difficult to work with, as I was trying to add
  tie-breaking mechanisms (not included in this release) and adding new systems.

  ### New API

  **Old:**

  ```typescript
  import { utils as voteUtils, VotingSystem } from 'votes'

  const scores = scoresFromBallots(
    [
      { ranking: [['Lion'], ['Bear'], ['Sheep']], weight: 4 },
      { ranking: [['Sheep'], ['Bear'], ['Lion']], weight: 3 },
      { ranking: [['Bear', 'Sheep'], ['Lion']], weight: 2 },
    ],
    ['Lion', 'Bear', 'Sheep'],
    VotingSystem.Schulze,
  )
  // -> { Lion: 0, Bear: 2, Sheep: 1 }
  const ranking = scoresToRanking({ Bear: 2, Lion: 0, Sheep: 1 })
  // -> [ [ 'Bear' ], [ 'Sheep' ], [ 'Lion' ] ]
  ```

  **New:**

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
  const scores = borda.scores()
  // -> { Bear: 10, Lion: 8, Sheep: 9}
  const ranking = borda.ranking()
  // -> [ [ 'Bear' ], [ 'Sheep' ], [ 'Lion' ] ]
  ```

  ### Back to classes

  My implementation of the voting systems keep on alternating between classes
  and some attempts of object composition. This time it was refactored to
  classes.

  ## Added systems
  - **Random candidate**: Selects a random ranking, regardless of ballots.

  - **Random dictator**: Selects a random ballot that decides the ranking.

  - **Bottom-two-runoff**: take the two options with the fewest first preference
    votes. The pairwise loser out of those two options is eliminated. Repeat.
