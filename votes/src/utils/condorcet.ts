/* eslint-disable @typescript-eslint/no-non-null-assertion */

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
    const dominating = new Set([k])
    const toCheck = [k]
    while (toCheck.length > 0)
      for (const d of dominatingDirectList[toCheck.pop()!]!)
        if (!dominating.has(d)) {
          dominating.add(d)
          toCheck.push(d)
        }

    return dominating.size === candidates.length
  })

  return {
    array: array
      .filter((_row, k1) => dominatingList[k1])
      .map((row) => row.filter((_v, k2) => dominatingList[k2])),
    candidates: candidates.filter((_c, k) => dominatingList[k]),
  }
}
