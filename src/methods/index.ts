import { VotingSystem } from '../types'
import { approbation } from './approbation'
import { borda } from './borda'
import { copeland } from './copeland'
import { firstPastThePost } from './first-past-the-post'
import { instantRunoff } from './instant-runoff'
import { kemeny } from './kemeny'
import { maximalLotteries } from './maximal-lotteries'
import { minimax } from './minimax'
import { rankedPairs } from './ranked-pairs'
import { schulze } from './schulze'
import { twoRoundRunoff } from './two-round-runoff'

export const methods = {
  [VotingSystem.Approbation]: approbation,
  [VotingSystem.Borda]: borda,
  [VotingSystem.Copeland]: copeland,
  [VotingSystem.FirstPastThePost]: firstPastThePost,
  [VotingSystem.InstantRunoff]: instantRunoff,
  [VotingSystem.Kemeny]: kemeny,
  [VotingSystem.MaximalLotteries]: maximalLotteries,
  [VotingSystem.Minimax]: minimax,
  [VotingSystem.RankedPairs]: rankedPairs,
  [VotingSystem.Schulze]: schulze,
  [VotingSystem.TwoRoundRunoff]: twoRoundRunoff,
}
