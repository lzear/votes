import { VotingSystem } from 'votes'

import type { DemoSystems } from '../store'

import { baldwin } from './baldwin'
import { borda } from './borda'
import { bottomTwo } from './bottom-two'
import { coombs } from './coombs'
import { copeland } from './copeland'
import { fptp } from './fptp'
import { instantRunoff } from './instant-runoff'
import { maximalLotteries } from './maximal-lotteries'
import { minimax } from './minimax'
import { minimaxTD } from './minimax-td'
import { nanson } from './nanson'
import { randomizedCondorcet } from './randomized-condorcet'
import { rankedPairs } from './ranked-pairs'
import { schulze } from './schulze'
import { smith } from './smith'
import { twoRoundsRunoff } from './two-rounds'
import type { MethodElements } from './types'

export const methods: { [k in DemoSystems]: MethodElements } = {
  [VotingSystem.Baldwin]: baldwin,
  [VotingSystem.Borda]: borda,
  [VotingSystem.BottomTwoRunoff]: bottomTwo,
  [VotingSystem.Coombs]: coombs,
  [VotingSystem.Copeland]: copeland,
  [VotingSystem.FirstPastThePost]: fptp,
  [VotingSystem.InstantRunoff]: instantRunoff,
  [VotingSystem.Minimax]: minimax,
  [VotingSystem.MinimaxTD]: minimaxTD,
  [VotingSystem.Nanson]: nanson,
  [VotingSystem.Smith]: smith,
  [VotingSystem.TwoRoundRunoff]: twoRoundsRunoff,
  [VotingSystem.RandomizedCondorcet]: randomizedCondorcet,
  [VotingSystem.MaximalLotteries]: maximalLotteries,
  [VotingSystem.RankedPairs]: rankedPairs,
  [VotingSystem.Schulze]: schulze,
}
