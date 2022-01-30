# votes

## 2.0.0

### Major Changes

- Convert all voting methods to classes. Breaking former syntax.

  These changes greatly reduce the number of lines per voting methods.

  ### BREAKING CHANGES

  Before v2

  ```ts
  import { borda, utils } from 'votes'

  const scoreObject = borda.computeFromBallots(ballots, candidates)
  const ranking = utils.scoresToRanking(scoreObject)
  ```

  After v2:

  ```ts
  import { Borda } from 'votes'

  const borda = new Borda({ ballots, candidates })

  const scoreObject = borda.scores()
  const ranking = borda.ranking()
  ```
