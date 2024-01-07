import React from 'react'
import { Github as Gh } from 'lucide-react'

import { VotingSystem } from 'votes'

export const W: React.ReactNode = (
  <span
    style={{
      background: 'lightgrey',
      borderRadius: 3,
      fontFamily: 'serif',
      padding: '0px 2px',
    }}
  >
    W
  </span>
)

const Wiki: React.FC<{ href: string }> = ({ href }) => <a href={href}>{W}</a>
const Github: React.FC<{ href: string }> = ({ href }) => (
  <a href={href}>
    <Gh />
  </a>
)

export enum Criteria {
  NonDictatorship = 'non-dictatorship',
  Condorcet = 'condorcet-criterion',
  Majority = 'majority',
  Monotonic = 'monotonicity',
  // NonDictatoship = 'NON-DICTATORSHIP',
  Pareto = 'pareto-criterion',
  IIA = 'iia',
  LIIA = 'liia',
  StrategyProof = 'strategy-proof',
}

export const criteria: Record<
  Criteria,
  {
    name: string
    short?: string
    description: React.ReactNode
  }
> = {
  [Criteria.Condorcet]: {
    name: 'Condorcet',
    description: (
      <>
        If one candidate wins all duels against others, then that candidate must
        win the election.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Condorcet_criterion" />
      </>
    ),
  },
  [Criteria.Majority]: {
    name: 'Majority',
    description: (
      <>
        If one candidate is ranked first by more than 50% of voters, then that
        candidate must win.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Majority_criterion" />
      </>
    ),
  },
  [Criteria.Monotonic]: {
    name: 'Monotonicity',
    description: (
      <>
        By redoing an election with everything unchanged but the preferences of
        1 voter, which now rank 1 candidate higher in the list, then the
        election result should not place this candidate lower than before. In
        other words, an individual should not be able to hurt an option by
        ranking it higher.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Monotonicity_criterion" />
      </>
    ),
  },
  [Criteria.Pareto]: {
    name: 'Pareto efficiency',
    description: (
      <>
        If every voter prefers alternative X over alternative Y, then the system
        prefers X over Y.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Pareto_efficiency" />
      </>
    ),
  },
  [Criteria.IIA]: {
    name: 'Independence of irrelevant alternatives',
    short: 'IIA',
    description: (
      <>
        Assuming voter preferences regarding other candidates are unchanged, the
        winner never changes if a non-winning candidate is added or removed.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Independence_of_irrelevant_alternatives" />
      </>
    ),
  },
  [Criteria.LIIA]: {
    name: 'Local Independence of irrelevant alternatives',
    short: 'LIIA',
    description: (
      <>
        Assuming voter preferences regarding other candidates are unchanged,
        removing the candidate at the first place or the last place should not
        change the order of the remaining candidates.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Independence_of_irrelevant_alternatives#Local_independence" />
      </>
    ),
  },
  [Criteria.NonDictatorship]: {
    name: 'Non-dictatorship',
    description: (
      <>
        The result of the voting cannot be determined by the preference of one
        voter without taking the other votes into account.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Non-dictatorship" />
      </>
    ),
  },
  [Criteria.StrategyProof]: {
    name: 'Strategy proof',
    description: (
      <>
        Lying about preferences never leads to a preferred outcome{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Comparison_of_electoral_systems#Strategy_criteria" />
      </>
    ),
  },
}

export type SystemCriteria = Record<Criteria, boolean | null>

//   : Record<
//   VotingSystem,
//   {
//     name: string
//     description: React.ReactNode
//     criteria: SystemCriteria
//   }
// >
export const votingTypeData = {
  [VotingSystem.MaximalLotteries]: {
    name: 'Maximal lotteries',
    description: (
      <>
        Build a lottery among candidates with probabilities corresponding to a
        Nash equilibrium.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Maximal_lotteries" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.IIA]: null,
      [Criteria.LIIA]: null,
      [Criteria.Monotonic]: false,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.RandomizedCondorcet]: {
    name: 'Randomized Condorcet',
    description: (
      <>
        Build a lottery among candidates with probabilities corresponding to a
        Nash equilibrium.{' '}
        <Github href="https://github.com/oscar6echo/randomized-condorcet-voting-system" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.IIA]: null,
      [Criteria.LIIA]: null,
      [Criteria.Monotonic]: false,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.RankedPairs]: {
    name: 'Ranked pairs',
    description: (
      <>
        Using the duel results as edges, build an acyclic graph starting by the
        strongest score differences. The roots of the graph are the winners.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Ranked_pairs" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: true,
      [Criteria.Monotonic]: true,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.Schulze]: {
    name: 'Schulze method',
    description: (
      <>
        From the votes, compute the results of all possible duels. Then remove
        the most indecisive (closest to 50/50) duels until there is an
        undefeated candidate, the winner. This popular voting system is used by
        several organizations (Ubuntu, Debian, Wikimedia...).{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Schulze_method" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: false,
      [Criteria.Monotonic]: true,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.Kemeny]: {
    name: 'Kemeny–Young method',
    description: (
      <>
        A relatively complex computation generating a preference order aiming to
        minimize dissatisfaction of the voters. Also known as Kemeny rule,
        VoteFair popularity ranking, the maximum likelihood method, and the
        median relation.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Kemeny%E2%80%93Young_method" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: true,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: true,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.Minimax]: {
    name: 'Minimax Condorcet method',
    description: (
      <>
        Ranking the candidates by smallest pairwise defeat.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Minimax_Condorcet_method" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: false,
      [Criteria.Monotonic]: true,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.MinimaxTD]: {
    name: 'Minimax-TD',
    description: (
      <>Ranking the candidates of the Smith set by smallest pairwise defeat.</>
    ),
    criteria: {
      [Criteria.NonDictatorship]: null,
      [Criteria.IIA]: null,
      [Criteria.LIIA]: null,
      [Criteria.Monotonic]: null,
      [Criteria.Pareto]: null,
      [Criteria.Majority]: null,
      [Criteria.Condorcet]: null,
      [Criteria.StrategyProof]: null,
    },
  },
  [VotingSystem.Copeland]: {
    name: "Copeland's method",
    description: (
      <>
        Rank candidates by number of duels won against other candidates.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Copeland%27s_method" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: false,
      [Criteria.Monotonic]: true,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.BottomTwoRunoff]: {
    name: 'Bottom Two Runoff',
    description: (
      <>
        Take the two options with the fewest first preference votes. The
        pairwise loser out of those two options is eliminated. Repeat.{' '}
        <Wiki href="https://electowiki.org/wiki/Bottom-Two-Runoff_IRV" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: null,
      [Criteria.IIA]: null,
      [Criteria.LIIA]: null,
      [Criteria.Monotonic]: null,
      [Criteria.Pareto]: null,
      [Criteria.Majority]: null,
      [Criteria.Condorcet]: null,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.Approbation]: {
    name: 'Approval voting',
    description: (
      <>
        Each voter can select (&ldquo;approve&rdquo;) any number of candidates.
        The winner is the most-approved candidate.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Approval_voting" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: true,
      [Criteria.IIA]: true,
      [Criteria.LIIA]: true,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: false,
      [Criteria.Condorcet]: false,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.Borda]: {
    name: "Borda's count",
    description: (
      <>
        For each voter, every candidate is given a number of points which equals
        the number of candidates ranked lower in the voter&apos;s preference.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Borda_count" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: true,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: false,
      [Criteria.Condorcet]: false,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: false,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.Baldwin]: {
    name: 'Baldwin method',
    description: (
      <>
        Iteratively eliminate candidates with the worst Borda score.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Nanson%27s_method#Baldwin_method" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: false,
      [Criteria.Pareto]: null,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: null,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.Smith]: {
    name: "Smith's method",
    description: (
      <>
        The dominating set are the winner of this voting system.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Smith_set#Smith's_method" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: null,
      [Criteria.Monotonic]: null,
      [Criteria.Pareto]: null,
      [Criteria.Majority]: null,
      [Criteria.Condorcet]: null,
      [Criteria.IIA]: null,
      [Criteria.LIIA]: null,
      [Criteria.StrategyProof]: null,
    },
  },
  [VotingSystem.Nanson]: {
    name: "Nanson's method",
    description: (
      <>
        Iteratively eliminate candidates with the below-average Borda score.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Nanson%27s_method" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: false,
      [Criteria.Pareto]: null,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: true,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: null,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.InstantRunoff]: {
    name: 'Instant-runoff',
    description: (
      <>
        Considering only the top choice of each voter, the candidate with the
        fewest votes is eliminated. The election repeats until there is a
        winner. This voting system is very similar to single transferable vote
        method.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Instant-runoff_voting" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: false,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: false,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: false,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.Coombs]: {
    name: 'Coombs rule',
    description: (
      <>
        Similarly to the instant-runoff. Each round, the most disliked candidate
        is eliminated{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Coombs%27_method" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: false,
      [Criteria.Pareto]: true,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: false,
      [Criteria.IIA]: null,
      [Criteria.LIIA]: null,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.TwoRoundRunoff]: {
    name: 'Two-round system',
    description: (
      <>
        If no candidate receives 50% of the votes in the first round, then a
        second round of voting is held with only the top two candidates.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Two-round_system" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: false,
      [Criteria.Monotonic]: false,
      [Criteria.Pareto]: false,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: false,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.FirstPastThePost]: {
    name: 'Plurality',
    description: (
      <>
        Simple voting method where only the preferred candidate of each voter
        gets 1 point. AKA first-past-the-post.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Plurality_voting" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: true,
      [Criteria.Pareto]: false,
      [Criteria.Majority]: true,
      [Criteria.Condorcet]: false,
      [Criteria.IIA]: false,
      [Criteria.LIIA]: false,
      [Criteria.StrategyProof]: false,
    },
  },
  [VotingSystem.RandomDictator]: {
    name: 'Random ballot',
    description: (
      <>
        Select a ballot at random. a.k.a. random dictator.{' '}
        <Wiki href="https://en.wikipedia.org/wiki/Random_ballot" />
      </>
    ),
    criteria: {
      [Criteria.NonDictatorship]: true,
      [Criteria.Monotonic]: true,
      [Criteria.Pareto]: false,
      [Criteria.Majority]: false,
      [Criteria.Condorcet]: false,
      [Criteria.IIA]: true,
      [Criteria.LIIA]: true,
      [Criteria.StrategyProof]: true,
    },
  },
} as const
