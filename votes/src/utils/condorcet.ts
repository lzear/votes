import _ from 'lodash'

import type { Matrix } from '../types'

import { makeAntisymetric } from './make-matrix'

export const findSmithSet = (_matrix: Matrix): Matrix => {
  const { candidates, array } = makeAntisymetric(_matrix)
  const dominatingDirectList = candidates.map((_c, k) =>
    array[k].map((_v, k2) => k2).filter((k2) => array[k][k2] >= 0),
  )
  const dominatingList = candidates.map((c, k) => {
    let dominating = [k]
    let toCheck = [k]
    while (toCheck.length > 0) {
      const check = toCheck.pop() as number
      const toAdd = _.difference(dominatingDirectList[check], dominating)
      dominating = [...dominating, ...toAdd]
      toCheck = [...toCheck, ...toAdd]
    }
    return dominating.length === candidates.length
  })

  return {
    array: array
      .filter((row, k1) => dominatingList[k1])
      .map((row) => row.filter((v, k2) => dominatingList[k2])),
    candidates: candidates.filter((c, k) => dominatingList[k]),
  }
}

// We renamed findCondorcet -> findSmithSet
// Keeping the old name exported, so we don't introduce breaking changes
export const findCondorcet = findSmithSet
