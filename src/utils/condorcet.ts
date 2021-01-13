import difference from 'lodash-es/difference'
import { Matrix } from '../types'

export const findCondorcet = ({ candidates, array }: Matrix): Matrix => {
  const dominatingDirectList = candidates.map((c, k) =>
    array[k].map((v, k2) => k2).filter((k2) => array[k][k2] >= 0),
  )
  const dominatingList = candidates.map((c, k) => {
    let dominating = [k]
    let toCheck = [k]
    while (toCheck.length) {
      const check = toCheck.pop() as number
      const toAdd = difference(dominatingDirectList[check], dominating)
      dominating = dominating.concat(toAdd)
      toCheck = toCheck.concat(toAdd)
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
