# votes

[![version](https://img.shields.io/npm/v/votes)](https://www.npmjs.com/package/votes)
![bundle size](https://img.shields.io/bundlephobia/min/votes)
[![Known Vulnerabilities](https://snyk.io/test/github/lzear/votes/badge.svg?targetFile=package.json)](https://snyk.io/test/github/lzear/votes?targetFile=package.json)
![downloads](https://img.shields.io/npm/dm/votes)
[![Build Status](https://travis-ci.com/lzear/votes.svg?branch=master)](https://travis-ci.com/lzear/votes)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/d2378c63d95f41efb79072176f015976)](https://www.codacy.com/gh/lzear/votes/dashboard?utm_source=github.com&utm_medium=referral&utm_content=lzear/votes&utm_campaign=Badge_Coverage)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/08af655918d741d1bffca7ec12ba72be)](https://app.codacy.com/gh/lzear/votes?utm_source=github.com&utm_medium=referral&utm_content=lzear/votes&utm_campaign=Badge_Grade_Settings)
[![CodeClimate Coverage](https://api.codeclimate.com/v1/badges/0a98aa30f16e04bc3eac/test_coverage)](https://codeclimate.com/github/lzear/votes/test_coverage)
[![CodeClimate Maintainability](https://api.codeclimate.com/v1/badges/0a98aa30f16e04bc3eac/maintainability)](https://codeclimate.com/github/lzear/votes/maintainability)
[![CodeFactor](https://www.codefactor.io/repository/github/lzear/votes/badge)](https://www.codefactor.io/repository/github/lzear/votes)
![codecov](https://codecov.io/gh/lzear/votes/branch/master/graph/badge.svg?token=Fd9Jk4FeBY)
![last commit](https://img.shields.io/github/last-commit/lzear/votes)
![language](https://img.shields.io/github/languages/top/lzear/votes)
[![license](https://img.shields.io/github/license/lzear/votes)](https://github.com/lzear/votes/blob/master/LICENSE)

> Implementation of some
> [electoral systems](https://en.wikipedia.org/wiki/Electoral_system)

## 🧑‍💻 Install

```sh
yarn add votes
```

## 🗳️ Use

```typescript
import { Borda } from 'votes'

const borda = new Borda({
  candidates: ['Lion', 'Bear', 'Sheep'],
  ballots: [
    { ranking: [['Lion'], ['Bear'], ['Sheep']], weight: 4 },
    { ranking: [['Sheep'], ['Bear'], ['Lion']], weight: 3 },
    { ranking: [['Bear', 'Sheep'], ['Lion']], weight: 2 },
  ],
})

const scores = borda.scores()
// -> { Bear: 10, Lion: 8, Sheep: 9}

const ranking = borda.ranking()
// -> [ [ 'Bear' ], [ 'Sheep' ], [ 'Lion' ] ]
```

## 📊 Voting systems

See
[Comparison of electoral systems (Wikipedia)](https://en.wikipedia.org/wiki/Comparison_of_electoral_systems)
for more information.

**⚠️Maximal lotteries & Randomized Condorcet⚠️** (Contain big implementation
errors!): Returns probabilities for each candidate that should be used for a
lottery between the Candidates. If a candidate is the Condorcet winner, its
probability will be 1. Despite being non-deterministic, those methods are the
fairest. Currently, these methods give incorrect results in many cases because
of mistakes in the codes!

**Ranked pairs**: Using the duel results as edges, build an acyclic graph
starting by the strongest score differences. The roots of the graph are the
winners.

**Schulze method**: From the votes, compute the results of all possible duels.
Then remove the most indecisive (closest to 50/50) duels until there is an
undefeated candidate, the winner. This popular voting system is used by several
organizations (Ubuntu, Debian, Wikimedia...).

**Kemeny–Young method**: A relatively complex computation generating a
preference order aiming to minimize dissatisfaction of the voters. Also known as
Kemeny rule, VoteFair popularity ranking, the maximum likelihood method, and the
median relation.

**Minimax Condorcet method**: Ranking the candidates by smallest pairwise
defeat.

**Copeland's method**: Rank candidates by number of duels won against other
candidates.

**Approval voting**: Each voter can select (“approve”) any number of candidates.
The winner is the most-approved candidate.

**Borda count**: For each voter, every candidate is given a number of points
which equals the number of candidates ranked lower in the voter's preference.

**Nanson method**: Iterative Borda count in which, each round, candidates
scoring the average score or less are eliminated.

**Baldwin method**: Iterative Borda count in which, each round, candidates
scoring the lowest score are eliminated.

**Instant-runoff**: Considering only the top choice of each voter, the candidate
with the fewest votes is eliminated. The election repeats until there is a
winner. This voting system is very similar to single transferable vote method.

**Coombs' method**: Each round, the candidate with the most last rank is
eliminated. The election repeats until there is a winner.

**Contingent vote** (immediate Two-round system): If no candidate receives 50%
of the votes in the first round, then a second round of voting is held with only
the top two candidates.

**Plurality**: Simple voting method where only the preferred candidate of each
voter gets 1 point. AKA first-past-the-post.

**Absolute majority**: Checks if a candidate is ranked first by more than 50% of
voters.

**Random candidate**: Selects a random ranking, regardless of ballots.

**Random dictator**: Selects a random ballot that decides the ranking.

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br /> Feel free to check
[issues page](https://github.com/lzear/votes/issues).
