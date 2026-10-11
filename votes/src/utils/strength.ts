import { roundToGrid } from './make-matrix'

/**
How `RankedPairs` and `Schulze` measure a pairwise win: by the winner's votes
(`'winning-votes'`, the default), or by the winner's votes minus the loser's
(`'margins'`). They differ only when some voters rank both candidates equal or
leave both unranked.
*/
export type Strength = 'margins' | 'winning-votes'

// Strength of a win by `xOverY` votes to `yOverX`.
export const winStrength = (
  strength: Strength,
  xOverY: number,
  yOverX: number,
): number => (strength === 'margins' ? roundToGrid(xOverY - yOverX) : xOverY)
