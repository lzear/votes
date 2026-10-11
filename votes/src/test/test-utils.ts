import { Election, type ElectionInput } from '../election'
import type { Ballot } from '../types'
import { toWeightedBallots } from '../utils'

export const closeTo = (num: number, numDigits?: number) =>
  expect.closeTo(num, numDigits) as number

type ABCDE = 'a' | 'b' | 'c' | 'd' | 'e'

export const abcde = ['a', 'b', 'c', 'd', 'e'] as ABCDE[]

const repeat = <T>(length: number, value: T): T[] =>
  Array.from({ length }, () => value)

export const balinski = toWeightedBallots([
  ...repeat(33, [['a'], ['b'], ['c'], ['d'], ['e']]),
  ...repeat(16, [['b'], ['d'], ['c'], ['e'], ['a']]),
  ...repeat(3, [['c'], ['d'], ['b'], ['a'], ['e']]),
  ...repeat(8, [['c'], ['e'], ['b'], ['d'], ['a']]),
  ...repeat(18, [['d'], ['e'], ['c'], ['b'], ['a']]),
  ...repeat(22, [['e'], ['c'], ['b'], ['d'], ['a']]),
]) as Ballot<ABCDE>[]

export const sW = toWeightedBallots([
  ...repeat(5, [['a'], ['c'], ['b'], ['e'], ['d']]),
  ...repeat(5, [['a'], ['d'], ['e'], ['c'], ['b']]),
  ...repeat(8, [['b'], ['e'], ['d'], ['a'], ['c']]),
  ...repeat(3, [['c'], ['a'], ['b'], ['e'], ['d']]),
  ...repeat(7, [['c'], ['a'], ['e'], ['b'], ['d']]),
  ...repeat(2, [['c'], ['b'], ['a'], ['d'], ['e']]),
  ...repeat(7, [['d'], ['c'], ['e'], ['b'], ['a']]),
  ...repeat(8, [['e'], ['b'], ['a'], ['d'], ['c']]),
]) as Ballot<ABCDE>[]

export const dummyProfile = toWeightedBallots([
  [['a'], ['b'], ['c'], ['d'], ['e']],
])

export const dummyProfile10: Ballot<ABCDE>[] = toWeightedBallots(
  repeat(10, [['a'], ['b'], ['c'], ['d'], ['e']]),
)

// The matrix of these wins: `[winner, loser, margin]`.
export const fromMargins = <C extends string>(
  candidates: C[],
  wins: [C, C, number][],
) => ({
  candidates,
  array: candidates.map((x) =>
    candidates.map((y) => wins.find(([w, l]) => w === x && l === y)?.[2] ?? 0),
  ),
})

export const matrixString = (matrix: number[][]): string => {
  const size = 6

  return (
    '\n' +
    matrix
      .map((r) =>
        r
          .map((c) =>
            (Math.round(c * 1000) / 1000)
              .toString()
              .padStart(size, ' ')
              .slice(0, Math.max(0, size)),
          )
          .join(' '),
      )
      .join('\n')
  )
}

// The first method's ranking and rounds: it breaks its round ties with the
// methods after it.
export const firstRun = <C extends string>(input: ElectionInput<C>) => {
  const [step] = new Election(input).result().steps
  return { ranking: step?.after ?? [], rounds: step?.runs[0]?.rounds ?? [] }
}

// b and d tie for last on 2 first choices; c, on 3, loses to both head to
// head. Whichever of b and d goes out, the other wins.
export const openTie = {
  candidates: ['a', 'b', 'c', 'd', 'e'],
  ballots: [
    ['b', 'e', 'd', 'a', 'c', 1],
    ['c', 'd', 'e', 'b', 'a', 3],
    ['b', 'a', 'e', 'd', 'c', 1],
    ['d', 'e', 'a', 'b', 'c', 2],
  ].map((b) => ({
    ranking: b.slice(0, -1).map((c) => [String(c)]),
    weight: Number(b.at(-1)),
  })),
}
