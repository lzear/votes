import { Ballot } from 'votes'

const candidates = ['🐸', '🐷', '🦁', '🐻', '🐭']

// const ballots: Ballot[] = [
//   { weight: 10, ranking: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
//   { weight: 10, ranking: [1, 2, 3, 4, 5, 6, 7, 8, 0, 9] },
//   { weight: 10, ranking: [2, 3, 4, 5, 6, 7, 8, 0, 1, 9] },
//   { weight: 10, ranking: [3, 4, 5, 6, 7, 8, 0, 1, 2, 9] },
//   { weight: 10, ranking: [4, 5, 6, 7, 8, 0, 1, 2, 3, 9] },
//   { weight: 10, ranking: [5, 6, 7, 8, 0, 1, 2, 3, 4, 9] },
//   { weight: 10, ranking: [6, 7, 8, 0, 1, 2, 3, 4, 5, 9] },
//   { weight: 10, ranking: [7, 8, 0, 1, 2, 3, 4, 5, 6, 9] },
//   // eslint-disable-next-line prettier/prettier
//   { weight: 9 , ranking: [8, 0, 1, 2, 3, 4, 5, 6, 7, 9] },
//   { weight: 11, ranking: [9, 1, 2, 3, 4, 5, 6, 7, 8, 0] },
// ].map((b) => ({ ...b, ranking: b.ranking.map((c) => [candidates[c]]) }))

// const ballots: Ballot[] = [
//   { weight: 10, ranking: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
//   { weight: 10, ranking: [1, 0, 2, 3, 4, 5, 6, 7, 8, 9] },
//   { weight: 10, ranking: [2, 0, 1, 3, 4, 5, 6, 7, 8, 9] },
//   { weight: 10, ranking: [3, 0, 1, 2, 4, 5, 6, 7, 8, 9] },
//   { weight: 10, ranking: [4, 0, 1, 2, 3, 5, 6, 7, 8, 9] },
//   { weight: 10, ranking: [5, 0, 1, 2, 3, 4, 6, 7, 8, 9] },
//   { weight: 10, ranking: [6, 0, 1, 2, 3, 4, 5, 7, 8, 9] },
//   { weight: 10, ranking: [7, 0, 1, 2, 3, 4, 5, 6, 8, 9] },
//   { weight: 10, ranking: [8, 0, 1, 2, 3, 4, 5, 6, 7, 9] },
//   { weight: 10, ranking: [9, 0, 1, 2, 3, 4, 5, 6, 7, 8] },
// ].map((b) => ({ ...b, ranking: b.ranking.map((c) => [candidates[c]]) }))

// const ballots: Ballot[] = [
//   { weight: 16, ranking: [0, 1, 2, 3, 4, 5] },
//   { weight: 16, ranking: [1, 0, 2, 3, 4, 5] },
//   { weight: 16, ranking: [2, 0, 1, 3, 5, 4] },
//   { weight: 16, ranking: [3, 0, 1, 2, 5, 4] },
//   { weight: 17, ranking: [4, 0, 1, 2, 3, 5] },
//   { weight: 18, ranking: [5, 0, 1, 2, 3, 4] },
// ].map((b) => ({ ...b, ranking: b.ranking.map((c) => [candidates[c]]) }))

const ballots: Ballot[] = [
  { weight: 18, ranking: [0, 1, 2, 4, 3] },
  { weight: 19, ranking: [1, 0, 2, 4, 3] },
  { weight: 20, ranking: [2, 0, 1, 3, 4] },
  { weight: 21, ranking: [3, 0, 1, 2, 4] },
  { weight: 22, ranking: [4, 0, 1, 2, 3] },
].map((b) => ({ ...b, ranking: b.ranking.map((c) => [candidates[c]]) }))

export const badTwoRounds = {
  ballots,
  candidates,
  name: 'Bad Two-round-runoff',
  description:
    'Example of election in which 🐭 the second most disliked candidate wins the election, even though an other candidate 🐸 wins all duels.',
}
