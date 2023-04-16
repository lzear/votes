import { VotingSystem } from '../types'

import { AbsoluteMajority } from './absolute-majority'
import { Approbation } from './approbation'
import { Baldwin } from './baldwin'
import { Borda } from './borda'
import { BottomTwoRunoff } from './bottom-two-runoff'
import { Coombs } from './coombs'
import { Copeland } from './copeland'
import { FirstPastThePost } from './first-past-the-post'
import { InstantRunoff } from './instant-runoff'
import { Kemeny } from './kemeny'
import { MajorityJudgment } from './majority-judgment'
import { MaximalLotteries } from './maximal-lotteries'
import { Minimax } from './minimax'
import { MinimaxTD } from './minimax-td'
import { Nanson } from './nanson'
import { RandomCandidates } from './random-candidates'
import { RandomDictator } from './random-dictator'
import { RandomizedCondorcet } from './randomized-condorcet'
import { RankedPairs } from './ranked-pairs'
import { Schulze } from './schulze'
import { Smith } from './smith'
import { TwoRoundRunoff } from './two-round-runoff'

export const methods = {
  [VotingSystem.AbsoluteMajority]: AbsoluteMajority,
  [VotingSystem.Approbation]: Approbation,
  [VotingSystem.Baldwin]: Baldwin,
  [VotingSystem.Borda]: Borda,
  [VotingSystem.BottomTwoRunoff]: BottomTwoRunoff,
  [VotingSystem.Coombs]: Coombs,
  [VotingSystem.Copeland]: Copeland,
  [VotingSystem.FirstPastThePost]: FirstPastThePost,
  [VotingSystem.InstantRunoff]: InstantRunoff,
  [VotingSystem.Kemeny]: Kemeny,
  [VotingSystem.MajorityJudgment]: MajorityJudgment,
  [VotingSystem.MaximalLotteries]: MaximalLotteries,
  [VotingSystem.Minimax]: Minimax,
  [VotingSystem.MinimaxTD]: MinimaxTD,
  [VotingSystem.Nanson]: Nanson,
  [VotingSystem.RandomCandidates]: RandomCandidates,
  [VotingSystem.RandomDictator]: RandomDictator,
  [VotingSystem.RandomizedCondorcet]: RandomizedCondorcet,
  [VotingSystem.RankedPairs]: RankedPairs,
  [VotingSystem.Schulze]: Schulze,
  [VotingSystem.Smith]: Smith,
  [VotingSystem.TwoRoundRunoff]: TwoRoundRunoff,
} as const

export type Methods = (typeof methods)[keyof typeof methods]
