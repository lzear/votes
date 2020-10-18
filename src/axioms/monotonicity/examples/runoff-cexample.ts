import { Rule } from '../../../types'

const a = [
  { weight: 6, ranking: [['a'], ['b'], ['c']] },
  { weight: 5, ranking: [['c'], ['a'], ['b']] },
  { weight: 4, ranking: [['b'], ['c'], ['a']] },
  { weight: 2, ranking: [['b'], ['a'], ['c']] },
]
const b = [
  { weight: 6, ranking: [['a'], ['b'], ['c']] },
  { weight: 5, ranking: [['c'], ['a'], ['b']] },
  { weight: 4, ranking: [['b'], ['c'], ['a']] },
  { weight: 2, ranking: [['a'], ['b'], ['c']] },
]

export function test(rule: Rule): boolean {
  const A = rule(a)
  const B = rule(b)
  return !(A[0].includes('a') && !B[0].includes('a'))
}
