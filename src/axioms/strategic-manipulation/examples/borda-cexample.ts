import { Rule } from '../../../types'

const a = [
  { weight: 1, ranking: [['a'], ['b'], ['c'], ['d']] },
  { weight: 2, ranking: [['a'], ['c'], ['b'], ['d']] },
  { weight: 2, ranking: [['b'], ['d'], ['c'], ['a']] },
  { weight: 2, ranking: [['c'], ['b'], ['d'], ['a']] },
]
const b = [
  { weight: 1, ranking: [['a'], ['b'], ['c'], ['d']] },
  { weight: 2, ranking: [['a'], ['c'], ['d'], ['b']] },
  { weight: 2, ranking: [['b'], ['d'], ['c'], ['a']] },
  { weight: 2, ranking: [['c'], ['b'], ['d'], ['a']] },
]

export const test = (rule: Rule): boolean => {
  const A = rule(a)
  const B = rule(b)
  return !(
    A[0].length === 1 &&
    B[0].length === 1 &&
    A[0][0] === 'b' &&
    B[0][0] !== 'b'
  )
}
