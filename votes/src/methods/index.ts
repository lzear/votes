import { VotingSystem } from '../types'
import { Approbation } from './approbation'
import { Baldwin } from './baldwin'
import { Borda } from './borda'
import { Coombs } from './coombs'
import { Copeland } from './copeland'
import { FirstPastThePost } from './first-past-the-post'
import { InstantRunoff } from './instant-runoff'
import { Kemeny } from './kemeny'
import { MaximalLotteries } from './maximal-lotteries'
import { Minimax } from './minimax'
import { Nanson } from './nanson'
import { RandomizedCondorcet } from './randomized-condorcet'
import { RankedPairs } from './ranked-pairs'
import { Schulze } from './schulze'
import { TwoRoundRunoff } from './two-round-runoff'

export const methods = {
  [VotingSystem.Approbation]: Approbation,
  [VotingSystem.Baldwin]: Baldwin,
  [VotingSystem.Borda]: Borda,
  [VotingSystem.Coombs]: Coombs,
  [VotingSystem.Copeland]: Copeland,
  [VotingSystem.FirstPastThePost]: FirstPastThePost,
  [VotingSystem.InstantRunoff]: InstantRunoff,
  [VotingSystem.Kemeny]: Kemeny,
  [VotingSystem.MaximalLotteries]: MaximalLotteries,
  [VotingSystem.Minimax]: Minimax,
  [VotingSystem.Nanson]: Nanson,
  [VotingSystem.RankedPairs]: RankedPairs,
  [VotingSystem.RandomizedCondorcet]: RandomizedCondorcet,
  [VotingSystem.Schulze]: Schulze,
  [VotingSystem.TwoRoundRunoff]: TwoRoundRunoff,
} as const
