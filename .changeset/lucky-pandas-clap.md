---
'votes': patch
---

Performance and packaging improvements:

- `matrixFromBallots` now indexes candidates with a `Map` and tracks unranked
  candidates with a `Set` (was O(ballots × candidates²)).
- New `pairwiseMatrix` utility; Copeland and Schulze share it.
- Simplify Ranked pairs winner detection (removes dead score bookkeeping).
- `package.json` `exports` now declares explicit `types` conditions and exposes
  `./package.json`.
- Remove the `utils.Edge` re-export; use `RankedPairsEdge` from the package
  root instead.
