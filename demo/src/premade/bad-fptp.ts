import type { Ballot } from 'votes'

const candidates = ['🐸', '🐷', '🦁', '🐻', '🐭']

const ballots: Ballot[] = [
  { weight: 10, ranking: [0, 1, 2, 3, 4] },
  { weight: 10, ranking: [1, 0, 2, 3, 4] },
  { weight: 10, ranking: [2, 0, 1, 3, 4] },
  { weight: 9, ranking: [3, 0, 1, 2, 4] },
  { weight: 11, ranking: [4, 0, 1, 2, 3] },
].map((b) => ({ ...b, ranking: b.ranking.map((c) => [candidates[c]]) }))

export const badFptp = {
  ballots,
  candidates,
  name: 'Bad First-past-the-post',
  description:
    'Example of election in which 🐭 the most disliked candidate (by far) wins the election, even though an other candidate 🐸 wins all duels.',
}
