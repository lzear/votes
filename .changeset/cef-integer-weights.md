---
'votes': patch
---

`stringifyCondorcetElectionFormat` throws a `RangeError` on a non-integer weight
and skips weight-0 ballots.
