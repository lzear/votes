import _ from 'lodash'
import { Matrix } from '../types'

export const findCondorcet = ({ candidates, array }: Matrix): Matrix => {
  const dominatingDirectList = candidates.map((c, k) =>
    array[k].map((v, k2) => k2).filter((k2) => array[k][k2] >= 0),
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
