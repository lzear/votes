import { VotingSystem } from 'votes'
import { DemoSystems } from '../store'
import { MethodElements } from './types'
import { baldwin } from './baldwin'
import { borda } from './borda'
import { bottomTwo } from './bottom-two'
import { coombs } from './coombs'
import { copeland } from './copeland'
import { fptp } from './fptp'
import { instantRunoff } from './instant-runoff'
import { minimax } from './minimax'
import { minimaxTD } from './minimax-td'
import { nanson } from './nanson'
import { twoRoundsRunoff } from './two-rounds'

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
  [VotingSystem.TwoRoundRunoff]: twoRoundsRunoff,
}
