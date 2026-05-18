import { zipObject } from 'lodash-es'
import type { ScoreObject } from '../types'

export const scoresAny = <C extends string>(candidates: C[], value: number) =>
  zipObject(
    candidates,
    Array.from<number>({ length: candidates.length }).fill(value),
  ) as ScoreObject<C>

export const scoresZero = <C extends string>(candidates: C[]) =>
  scoresAny(candidates, 0)
