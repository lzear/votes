import { Ballot } from '../types'

const candidates = ['🐸', '🐷', '🦁', '🐻', '🐭']

const ballots: Ballot[] = [
  { weight: 2, ranking: [[3], [2, 4], [1], [5]] },
  { weight: 3, ranking: [[5], [4], [2], [1], [3]] },
  { weight: 5, ranking: [[4], [5], [3], [2], [1]] },
  { weight: 7, ranking: [[4], [2, 5], [3], [1]] },
  { weight: 8, ranking: [[2], [3], [1], [4], [5]] },
  { weight: 9, ranking: [[3], [4], [1], [2, 5]] },
  { weight: 10, ranking: [[2, 1], [3, 5], [4]] },
  { weight: 10, ranking: [[4], [5], [1], [3], [2]] },
  { weight: 14, ranking: [[5], [1], [2], [3], [4]] },
].map((b) => ({
  ...b,
  ranking: b.ranking.map((r) => r.map((c) => candidates[c - 1])),
}))

export const condorcetMess = { ballots, candidates }
