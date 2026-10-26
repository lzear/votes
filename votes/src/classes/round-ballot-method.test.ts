import { BottomTwoRunoff } from '../methods/bottom-two-runoff'
import { InstantRunoff } from '../methods/instant-runoff'

const names = (n: number) =>
  Array.from({ length: n }, (_, i) => `c${String(i).padStart(2, '0')}`)

// Each of `candidates` first on `copies` ballots, each ballot one rotation of
// their order: every race ties.
const rotations = (candidates: string[], copies: number) =>
  Array.from({ length: candidates.length * copies }, (_, j) => {
    const i = j % candidates.length
    return {
      ranking: [...candidates.slice(i), ...candidates.slice(0, i)].map((c) => [
        c,
      ]),
    }
  })

// Every strict order of `candidates` once.
const orders = (candidates: string[]): string[][] =>
  candidates.length <= 1
    ? [candidates]
    : candidates.flatMap((c, i) =>
        orders(candidates.toSpliced(i, 1)).map((o) => [c, ...o]),
      )

describe('the search for who wins in some order of breaking a tie', () => {
  it('reads identical ballots as one', () => {
    const candidates = names(12)
    const ballots = rotations(candidates, 1000)
    for (const Method of [InstantRunoff, BottomTwoRunoff])
      expect(new Method({ candidates, ballots }).ranking()).toStrictEqual([
        candidates,
      ])
  })

  it('stops on everyone left past its ballots read', () => {
    const candidates = names(8)
    const ballots = orders(candidates).map((o) => ({
      ranking: o.map((c) => [c]),
    }))
    expect(
      new BottomTwoRunoff({ candidates, ballots }).ranking(),
    ).toStrictEqual([candidates])
  })
})
