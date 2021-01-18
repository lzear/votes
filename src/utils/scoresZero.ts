import { zipObject } from 'lodash-es'
import { ScoreObject } from '../types'

export const scoresZero = (candidates: string[]): ScoreObject =>
  zipObject(candidates, new Array(candidates.length).fill(0))
