import zipObject from 'lodash-es/zipObject'
import { ScoreObject } from '../types'

export const scoresZero = (candidates: string[]): ScoreObject =>
  zipObject(candidates, new Array(candidates.length).fill(0))
