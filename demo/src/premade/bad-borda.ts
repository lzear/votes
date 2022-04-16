import { Ballot } from 'votes'

const candidates = ['🐻', '🦁', '🐷']

const ballots: Ballot[] = [
  { weight: 49, ranking: [[1], [2], [3]] },
  { weight: 49, ranking: [[2], [1], [3]] },
  { weight: 2, ranking: [[3], [2, 1]] },
].map((b) => ({
  ...b,
  ranking: b.ranking.map((r) => r.map((c) => candidates[c - 1])),
}))

export const badBorda = {
  ballots,
  candidates,

  name: 'Bad Borda',
  description:
    "With these real-preferences, it is in the voters' interest to use the most disliked candidate as a buffer in order to bury the competition. With voters using this strategy, the election becomes unfair. If too many voters use this strategy, there is a risk that the most disliked candidate will be elected.",
}
