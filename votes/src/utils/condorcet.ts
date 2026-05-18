/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { difference } from 'lodash-es'
import type { Matrix } from '../types'
import { makeAntisymmetric } from './make-matrix'

export const findSmithSet = <C extends string>(
  _matrix: Matrix<C>,
): Matrix<C> => {
  const { candidates, array } = makeAntisymmetric(_matrix)
  const dominatingDirectList = candidates.map((_c, k) =>
    array[k]!.map((_v, k2) => k2).filter((k2) => array[k]![k2]! >= 0),
  )
  const dominatingList = candidates.map((_c, k) => {
    let dominating = [k]
    let toCheck = [k]
    while (toCheck.length > 0) {
      const check = toCheck.pop()!
      const toAdd = difference(dominatingDirectList[check], dominating)
      dominating = [...dominating, ...toAdd]
      toCheck = [...toCheck, ...toAdd]
    }
    return dominating.length === candidates.length
  })

  return {
    array: array
      .filter((_row, k1) => dominatingList[k1])
      .map((row) => row.filter((_v, k2) => dominatingList[k2])),
    candidates: candidates.filter((_c, k) => dominatingList[k]),
  }
}

// We renamed findCondorcet -> findSmithSet
// Keeping the old name exported, so we don't introduce breaking changes
export const findCondorcet = findSmithSet
