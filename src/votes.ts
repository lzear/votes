// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
import borda from './votes/methods/borda'
import { Method, PollType } from './votes/types'
import approbation from './votes/methods/approbation'
import majority from './votes/methods/majority'
import runoff from './votes/methods/runoff'
import kemeny from './votes/methods/kemeny'

const methods: { [type in PollType]: Method } = {
  [PollType.Majority]: majority,
  [PollType.Approbation]: approbation,
  [PollType.Borda]: borda,
  [PollType.Kemeny]: kemeny,
  [PollType.Runoff]: runoff
}
export default methods
