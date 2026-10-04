import { type ScoreObject } from '../types'

export const scoresAny = <C extends string>(
  candidates: readonly C[],
  value: number,
): ScoreObject<C> =>
  Object.fromEntries(candidates.map((c) => [c, value])) as ScoreObject<C>

export const scoresZero = <C extends string>(
  candidates: readonly C[],
): ScoreObject<C> => scoresAny(candidates, 0)
