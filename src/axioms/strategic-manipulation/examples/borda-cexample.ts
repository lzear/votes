import { Rule } from '../../../types'

const scores2ranking = require('../../../utils/scores2ranking')

const a = [
  { weight: 1, ranking: [['a'], ['b'], ['c'], ['d']] },
  { weight: 2, ranking: [['a'], ['c'], ['b'], ['d']] },
  { weight: 2, ranking: [['b'], ['d'], ['c'], ['a']] },
  { weight: 2, ranking: [['c'], ['b'], ['d'], ['a']] }
]
const b = [
  { weight: 1, ranking: [['a'], ['b'], ['c'], ['d']] },
  { weight: 2, ranking: [['a'], ['c'], ['d'], ['b']] },
  { weight: 2, ranking: [['b'], ['d'], ['c'], ['a']] },
  { weight: 2, ranking: [['c'], ['b'], ['d'], ['a']] }
]

export const test = (rule: Rule) => {
  const A = scores2ranking(rule(a))
  const B = scores2ranking(rule(b))
  return !(A[0].length === 1 && B[0].length === 1 && A[0][0] === 'b' && B[0][0] !== 'b')
}
