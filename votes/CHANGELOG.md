# votes

## 4.0.0

### Major Changes

- 86d4131: `Approbation` is `Approval` (`VotingSystem.Approval`, `'APPROVAL'`).
- 37c4d6b: Drop the `utils` namespace and `Minimax.Variants`; export
  `matrixFromBallots`, `makeAntisymmetric`, `smithSet`, `normalizeBallots`,
  `groupBallots`, `toWeightedBallots`, `scoresToRanking` and `rngGenerator` at
  the top level.
- e8007d8: Rounds are flat: `roundResult` fields moved up, `idx` is `index`, no
  `finished`.
- 86d4131: `VotingSystem.MajorityJudgment` is `'MAJORITY_JUDGMENT'`.
- e4c7bb5: `VotingSystem` and `MinimaxVariant` are `as const` objects, no longer
  enums.
- 91de1b0: Refactor everything. New API. Main changes:

  - Remove external dependency `javascript-lp-solver`.
  - Implement tie-breaking mechanism: round-based methods take `tieBreakers`,
    built with `tb()`.
  - New `Election` class to chain methods: each re-ranks the tiers still tied.
  - New `unrankedLast` option: by default unranked candidates join a ballot as
    one tied bottom tier; pass `false` to score only expressed preferences.
  - Round-based methods report per-round details: scores, tie-break steps, and
    method-specific `info` (`CoombsInfo`, `NansonInfo`).
  - Round-method `ranking()` now includes the winners tier.
  - New `Schulze#strengths()` exposing the beatpath strength matrix.
  - New `iteratedRanking()` on all methods and `Election`: fill each place by
    re-running the full method without the already-placed candidates, instead of
    using the method's own full ranking. `restrict()` is now public.
  - New `deTie()` on all methods: re-rank each tie with the same method.
  - New Condorcet Election Format parser and writer.
  - Ranked pairs: fix infinite recursion on raw win-count matrices with wide
    ties.

- 28b60e2: `computeRounds()` is `rounds()`; random methods, `RandomDictator`
  included, report `probabilities()` instead of `scores()`. New `Ranker` type
  for any method.
- 810b93a: Every method takes `{ candidates, ballots, unrankedLast }`; matrix
  methods also take a matrix. `needsMatrix`, `needsBallot` and the category
  helpers are gone.

### Minor Changes

- f8afd81: Blank ballots count toward majorities and in random dictator's draw
  only with the new `countBlank` option.
- d9dddb6: Majority judgment takes a `grades` option (default 6) and throws on a
  grade past it.
- d9dddb6: Majority judgment gives the worst grade to candidates a ballot leaves
  out, unless `unrankedLast: false`.
- 39fe6b0: A ballot's `weight` is optional, 1 by default.
- fb7f988: Inputs take readonly arrays, such as `as const` candidates.
- dc1af2f: Throw a `RangeError` on a negative or non-finite weight (majority
  judgment ran out of memory on one) or a malformed matrix.

### Patch Changes

- d9dddb6: Random dictator ranks the candidates its ballot leaves out last.
- 66c4d45: Random methods draw their ranking once per instance.
- d9dddb6: Drop the lodash-es dependency.
- d9dddb6: Faster bottom-two runoff head-to-head.
- d9dddb6: Faster Baldwin and Nanson.
- d9dddb6: Faster instant runoff, Coombs and bottom-two runoff.
- d9dddb6: Normalize ballots in one pass.
- 96e43d6: Faster ranked pairs.
- 4556235: Fractional weights that sum alike tie: `matrixFromBallots` rounds to
  the tie tolerance, and absolute majorities allow for it.
- d9dddb6: Kemeny runs in O(n·2ⁿ), not O(n!), takes up to 30 candidates, and
  averages scores over its best orders.
- d9dddb6: Maximal lotteries and randomized Condorcet never draw a candidate of
  probability 0.
- 5292995: Faster `matrixFromBallots`; `exports` declare explicit `types`
  conditions; Ranked pairs' `Edge` type is `RankedPairsEdge`.
- 9702df3: `matrixFromBallots` counts a candidate listed twice once.
- a23f408: Minimax with `excludeTies` scores a candidate tied with everyone by
  its ties, not first.
- d9dddb6: Majority judgment follows Balinski–Laraki: lower median, ties broken
  by majority value.
- d9dddb6: Majority judgment grades a candidate once per ballot.
- d9dddb6: Stop publishing test files.
- d14a84e: Minimax, ranked pairs and Schulze keep a candidate named `__proto__`.
- d9dddb6: Ranked pairs no longer locks pairwise defeats.
- d154b88: Random candidates takes an rng that returns 1.
- d9dddb6: Schulze ties candidates neither of whom beats the other.
- d9dddb6: Scores within the tie tolerance, or both infinite, tie whatever the
  candidate order.
- f055513: Ship the README.

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
