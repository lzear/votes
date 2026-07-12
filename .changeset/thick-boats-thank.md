---
'votes': major
---

Refactor everything. New API. Main changes:

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
- Ranked pairs: fix infinite recursion on raw win-count matrices with wide ties.
