# votes

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

  ### Monorepo

  The repository now also contains the code for a demo, which will be hosted on
  www.rank-votes.vercel.app

  ### Back to classes

  My implementation of the voting systems keep on alternating between classes
  and some attempts of object composition. This time it was refactored to
  classes.

  ## Added systems

  - **Random candidate**: Selects a random ranking, regardless of ballots.

  - **Random dictator**: Selects a random ballot that decides the ranking.

  - **Bottom-two-runoff**: take the two options with the fewest first preference
    votes. The pairwise loser out of those two options is eliminated. Repeat.
