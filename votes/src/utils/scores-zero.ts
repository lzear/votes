import { zipObject } from 'lodash-es'
import type { ScoreObject } from '../types'

export const scoresAny = (candidates: string[], value: number): ScoreObject =>
  zipObject(candidates, Array.from({ length: candidates.length }).fill(value))

export const scoresZero = (candidates: string[]): ScoreObject =>
  scoresAny(candidates, 0)
