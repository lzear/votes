import { Ballot } from 'votes'

const candidates = ['🐸', '🐷', '🦁', '🐻', '🐭']

const ballots: Ballot[] = [
  { weight: 33, ranking: [1, 2, 3, 4, 5] },
  { weight: 16, ranking: [2, 4, 3, 5, 1] },
  { weight: 3, ranking: [3, 4, 2, 1, 5] },
  { weight: 8, ranking: [3, 5, 2, 4, 1] },
  { weight: 18, ranking: [4, 5, 3, 2, 1] },
  { weight: 22, ranking: [5, 3, 2, 4, 1] },
].map((b) => ({ ...b, ranking: b.ranking.map((c) => [candidates[c - 1]]) }))

export const balinski = {
  ballots,
  candidates,
  name: 'Balinski',
  description:
    "Particular preferences leading to different results when used with these 5 voting systems: First-past-the-post, Two-round-runoff, Borda rule, Instant-runoff, Copeland's rule.",
}
