import zipObject from 'lodash/zipObject'
import { ScoreObject } from '../types'

export const scoresAny = (candidates: string[], value: number): ScoreObject =>
  zipObject(candidates, new Array(candidates.length).fill(value))

export const scoresZero = (candidates: string[]): ScoreObject =>
  scoresAny(candidates, 0)
