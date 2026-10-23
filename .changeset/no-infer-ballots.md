---
'votes': major
---

A ballot naming a non-candidate no longer compiles: with literal candidates and
`Ballot<string>[]` ballots, write `new Borda<string>(…)`.

`normalizeBallots` and `groupBallots` type the rankings and weights they return,
and take ballots ranking other candidates.
