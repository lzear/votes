import type { MethodCtor } from '../classes/method'
import { VotingSystem } from '../types'
import { AbsoluteMajority } from './absolute-majority'
import { AntiPlurality } from './anti-plurality'
import { Approval } from './approval'
import { Baldwin } from './baldwin'
import { Benham } from './benham'
import { Black } from './black'
import { Borda } from './borda'
import { BottomTwoRunoff } from './bottom-two-runoff'
import { Bucklin } from './bucklin'
import { CandidateOrder } from './candidate-order'
import { Coombs } from './coombs'
import { Copeland } from './copeland'
import { Dictator } from './dictator'
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
import { SmithInstantRunoff } from './smith-instant-runoff'
import { SplitCycle } from './split-cycle'
import { StableVoting } from './stable-voting'
import { SupplementaryVote } from './supplementary-vote'
import { TidemanAlternative } from './tideman-alternative'
import { TwoRoundRunoff } from './two-round-runoff'
import { Woodall } from './woodall'

/**
Each method's class by its `VotingSystem` id: `methods[VotingSystem.Borda]`
is `Borda`.
*/
export const methods = {
  [VotingSystem.AbsoluteMajority]: AbsoluteMajority,
  [VotingSystem.AntiPlurality]: AntiPlurality,
  [VotingSystem.Approval]: Approval,
  [VotingSystem.Baldwin]: Baldwin,
  [VotingSystem.Benham]: Benham,
  [VotingSystem.Black]: Black,
  [VotingSystem.Borda]: Borda,
  [VotingSystem.BottomTwoRunoff]: BottomTwoRunoff,
  [VotingSystem.Bucklin]: Bucklin,
  [VotingSystem.CandidateOrder]: CandidateOrder,
  [VotingSystem.Coombs]: Coombs,
  [VotingSystem.Copeland]: Copeland,
  [VotingSystem.Dictator]: Dictator,
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
  [VotingSystem.SmithInstantRunoff]: SmithInstantRunoff,
  [VotingSystem.SplitCycle]: SplitCycle,
  [VotingSystem.StableVoting]: StableVoting,
  [VotingSystem.SupplementaryVote]: SupplementaryVote,
  [VotingSystem.TidemanAlternative]: TidemanAlternative,
  [VotingSystem.TwoRoundRunoff]: TwoRoundRunoff,
  [VotingSystem.Woodall]: Woodall,
} as const satisfies Record<VotingSystem, MethodCtor<string>>

/**
Any method class `methods` holds.
*/
export type Methods = (typeof methods)[keyof typeof methods]
