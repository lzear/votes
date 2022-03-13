import { baldwin } from './baldwin'
import { borda } from './borda'
import { instantRunoff } from './instant-runoff'
import { fptp } from './fptp'
import { twoRoundsRunoff } from './two-rounds'
import { copeland } from './copeland'
import { VotingSystem } from 'votes'
import { MethodElements } from './types'
import { DemoSystems } from '../store'
import { nanson } from './nanson'
import { coombs } from './coombs'
import { bottomTwo } from './bottomTwo'
import { rankedPairs } from './ranked-pairs'

export const methods: { [k in DemoSystems]: MethodElements } = {
  [VotingSystem.Baldwin]: baldwin,
  [VotingSystem.Borda]: borda,
  [VotingSystem.BottomTwoRunoff]: bottomTwo,
  [VotingSystem.Coombs]: coombs,
  [VotingSystem.Copeland]: copeland,
  [VotingSystem.InstantRunoff]: instantRunoff,
  [VotingSystem.TwoRoundRunoff]: twoRoundsRunoff,
  [VotingSystem.FirstPastThePost]: fptp,
  [VotingSystem.Nanson]: nanson,
  [VotingSystem.RankedPairs]: rankedPairs,
}
