import { VotingSystem } from '../types'
import { approbation } from './approbation'
import { baldwin } from './baldwin'
import { borda } from './borda'
import { coombs } from './coombs'
import { copeland } from './copeland'
import { firstPastThePost } from './first-past-the-post'
import { instantRunoff } from './instant-runoff'
import { kemeny } from './kemeny'
import { maximalLotteries } from './maximal-lotteries'
import { minimax } from './minimax'
import { nanson } from './nanson'
import { rankedPairs } from './ranked-pairs'
import { randomizedCondorcet } from './randomized-condorcet'
import { schulze } from './schulze'
import { twoRoundRunoff } from './two-round-runoff'

export const methods = {
  [VotingSystem.Approbation]: approbation,
  [VotingSystem.Baldwin]: baldwin,
  [VotingSystem.Borda]: borda,
  [VotingSystem.Coombs]: coombs,
  [VotingSystem.Copeland]: copeland,
  [VotingSystem.FirstPastThePost]: firstPastThePost,
  [VotingSystem.InstantRunoff]: instantRunoff,
  [VotingSystem.Kemeny]: kemeny,
  [VotingSystem.MaximalLotteries]: maximalLotteries,
  [VotingSystem.Minimax]: minimax,
  [VotingSystem.Nanson]: nanson,
  [VotingSystem.RankedPairs]: rankedPairs,
  [VotingSystem.RandomizedCondorcet]: randomizedCondorcet,
  [VotingSystem.Schulze]: schulze,
  [VotingSystem.TwoRoundRunoff]: twoRoundRunoff,
}
