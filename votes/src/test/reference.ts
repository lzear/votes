// Reference implementations, written from each method's definition rather
// than the library's code, for differential checks (`../reference.test.ts`).
// Strict profiles hold complete strict ballots; tied ones, ties and truncated
// ballots, unranked candidates tied last.
import { shuffleArray } from '../utils/shuffle-array'

export type RefBallot = { ranking: string[][]; weight: number }
export type RefProfile = { candidates: string[]; ballots: RefBallot[] }
type Scores = Record<string, number>
// A winner, or null when a tie decides who: the check skips the profile.
type Winner = string | null

const NAMES = ['a', 'b', 'c', 'd', 'e', 'f']

export const profileGenerator = (rng: () => number) => {
  const int = (n: number) => Math.floor(rng() * n)
  const strict = (n: number, voters: number): RefProfile => {
    const candidates = NAMES.slice(0, n)
    return {
      candidates,
      ballots: Array.from({ length: voters }, () => ({
        ranking: shuffleArray(candidates, rng).map((c) => [c]),
        weight: 1 + int(5),
      })),
    }
  }
  const tied = (n: number, voters: number): RefProfile => {
    const candidates = NAMES.slice(0, n)
    return {
      candidates,
      ballots: Array.from({ length: voters }, () => {
        const ranked = shuffleArray(candidates, rng).slice(0, 1 + int(n))
        const ranking: string[][] = []
        for (const c of ranked) {
          const tier = ranking.at(-1)
          if (tier && rng() < 0.3) tier.push(c)
          else ranking.push([c])
        }
        return { ranking, weight: 1 + int(4) }
      }),
    }
  }
  return { int, strict, tied }
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const zeros = (candidates: string[]): Scores =>
  Object.fromEntries(candidates.map((c) => [c, 0]))
const byNumber = (x: number, y: number) => x - y

// Each candidate's tier on the ballot.
const positions = (b: RefBallot) => {
  const m = new Map<string, number>()
  for (const [i, tier] of b.ranking.entries())
    for (const c of tier) if (!m.has(c)) m.set(c, i)
  return m
}

// N[i][j]: weight ranking i above j, unranked tied last (blank ballots: none).
export const pairwise = ({ candidates, ballots }: RefProfile): number[][] => {
  const n = candidates.length
  const N = range(n).map(() => range(n).map(() => 0))
  for (const b of ballots) {
    if (b.ranking.flat().length === 0) continue
    const pos = positions(b)
    for (const i of range(n))
      for (const j of range(n)) {
        const pi = pos.get(candidates[i]!) ?? Infinity
        const pj = pos.get(candidates[j]!) ?? Infinity
        if (pi < pj) N[i]![j]! += b.weight
      }
  }
  return N
}

// Strongest path between every ordered pair, by enumerating simple paths.
export const strongestPaths = (d: number[][]): number[][] => {
  const n = d.length
  const P = range(n).map(() => range(n).map(() => 0))
  for (const s of range(n)) {
    const seen = new Set([s])
    const dfs = (u: number, w: number) => {
      for (const v of range(n))
        if (!seen.has(v) && d[u]![v]! > 0) {
          const x = Math.min(w, d[u]![v]!)
          if (x > P[s]![v]!) P[s]![v] = x
          seen.add(v)
          dfs(v, x)
          seen.delete(v)
        }
    }
    dfs(s, Infinity)
  }
  return P
}

// Tiers of those nobody left beats.
const layer = (n: number, beats: (x: number, y: number) => boolean) => {
  let left = range(n)
  const tiers: number[][] = []
  while (left.length > 0) {
    const top = left.filter((i) => left.every((j) => !beats(j, i)))
    if (top.length === 0) throw new Error('cycle in layering')
    tiers.push(top)
    left = left.filter((i) => !top.includes(i))
  }
  return tiers
}
const names = (c: string[], tiers: number[][]) =>
  tiers.map((t) => t.map((i) => c[i]!))

export const schulze = (c: string[], N: number[][], strength: string) => {
  const d = N.map((row, i) =>
    row.map((v, j) => {
      if (i === j || v <= N[j]![i]!) return 0
      return strength === 'margins' ? v - N[j]![i]! : v
    }),
  )
  const S = strongestPaths(d)
  return names(
    c,
    layer(c.length, (j, i) => S[j]![i]! > S[i]![j]!),
  )
}

const reaches = (adj: Set<number>[], from: number, to: number) => {
  const seen = new Set([from])
  const stack = [from]
  for (let u = stack.pop(); u !== undefined; u = stack.pop()) {
    if (u === to) return true
    const next = adj[u]!
    for (const v of next)
      if (!seen.has(v)) {
        seen.add(v)
        stack.push(v)
      }
  }
  return false
}

// Ranked Pairs as the library documents it: equal-strength wins lock together
// unless on a cycle with the locked ones plus their whole group; winners are
// the sources, the rest ranked by running again.
export const rankedPairs = (
  c: string[],
  N: number[][],
  strength: string,
): string[][] => {
  const n = c.length
  if (n === 0) return []
  const edges = range(n).flatMap((f) =>
    range(n).flatMap((t) => {
      if (N[f]![t]! <= N[t]![f]!) return []
      const v = strength === 'margins' ? N[f]![t]! - N[t]![f]! : N[f]![t]!
      return { f, t, v }
    }),
  )
  const locked: Set<number>[] = c.map(() => new Set())
  const levels = [...new Set(edges.map((e) => e.v))].toSorted(byNumber)
  for (const level of levels.toReversed()) {
    const group = edges.filter((e) => e.v === level)
    const withGroup = locked.map((s) => new Set(s))
    for (const e of group) withGroup[e.f]!.add(e.t)
    const lock = group.filter((e) => !reaches(withGroup, e.t, e.f))
    for (const e of lock) locked[e.f]!.add(e.t)
  }
  const beaten = new Set(locked.flatMap((s) => [...s]))
  const winners = range(n).filter((i) => !beaten.has(i))
  if (winners.length === n || winners.length === 0) return [c]
  const rest = range(n).filter((i) => !winners.includes(i))
  return [
    winners.map((i) => c[i]!),
    ...rankedPairs(
      rest.map((i) => c[i]!),
      rest.map((i) => rest.map((j) => N[i]![j]!)),
      strength,
    ),
  ]
}

const permutations = (xs: number[]): number[][] =>
  xs.length <= 1
    ? [xs]
    : xs.flatMap((x, i) =>
        permutations(xs.toSpliced(i, 1)).map((p) => [x, ...p]),
      )

// Over every optimal order, how many each candidate ranks above on average.
export const kemenyScores = (c: string[], N: number[][]): Scores => {
  const n = c.length
  const all = permutations(range(n))
  const cost = (p: number[]) => {
    let s = 0
    for (let a = 0; a < n; a++)
      for (let b = a + 1; b < n; b++) s += N[p[b]!]![p[a]!]!
    return s
  }
  const costs = all.map((p) => cost(p))
  const best = Math.min(...costs)
  const optimal = all.filter((_, k) => costs[k]! <= best + 1e-9)
  const below = range(n).map(() => 0)
  for (const p of optimal)
    for (const [k, x] of p.entries()) below[x]! += n - 1 - k
  return Object.fromEntries(c.map((x, i) => [x, below[i]! / optimal.length]))
}

// Split Cycle: i defeats j when its margin beats every path from j back to i.
const splitCycleDefeat = (N: number[][]) => {
  const m = (i: number, j: number) => N[i]![j]! - N[j]![i]!
  const d = N.map((row, i) => row.map((_, j) => Math.max(m(i, j), 0)))
  const S = strongestPaths(d)
  return (i: number, j: number) => m(i, j) > 0 && m(i, j) > S[j]![i]!
}

export const splitCycle = (c: string[], N: number[][]) =>
  names(c, layer(c.length, splitCycleDefeat(N)))

const sub = (N: number[][], idx: number[]) =>
  idx.map((i) => idx.map((j) => N[i]![j]!))

// Stable Voting, as Holliday & Pacuit state it, on candidate indexes `idx`.
const stableWinners = (
  N: number[][],
  idx: number[],
  memo: Map<string, number[]>,
): number[] => {
  const key = idx.join(',')
  const known = memo.get(key)
  if (known) return known
  if (idx.length === 1) return idx
  const defeats = splitCycleDefeat(sub(N, idx))
  const undefeated = idx.filter((_, a) => idx.every((_, b) => !defeats(b, a)))
  const pairs = undefeated.flatMap((a) =>
    idx.filter((b) => b !== a).map((b) => ({ a, b, m: N[a]![b]! - N[b]![a]! })),
  )
  const levels = [...new Set(pairs.map((p) => p.m))].toSorted(byNumber)
  for (const level of levels.toReversed()) {
    const w = new Set(
      pairs
        .filter(
          (p) =>
            p.m === level &&
            stableWinners(
              N,
              idx.filter((x) => x !== p.b),
              memo,
            ).includes(p.a),
        )
        .map((p) => p.a),
    )
    if (w.size > 0) {
      const r = undefeated.filter((x) => w.has(x))
      memo.set(key, r)
      return r
    }
  }
  throw new Error('Stable Voting elected no one')
}

export const stableVoting = (c: string[], N: number[][]) => {
  let left = range(c.length)
  const tiers: string[][] = []
  const memo = new Map<string, number[]>()
  while (left.length > 0) {
    const w = stableWinners(N, left, memo)
    tiers.push(w.map((i) => c[i]!))
    left = left.filter((i) => !w.includes(i))
  }
  return tiers
}

// Smallest set whose members each beat every non-member.
export const smith = (c: string[], N: number[][]) => {
  const n = c.length
  const subsets = range(1 << n).map((mask) =>
    range(n).filter((i) => mask & (1 << i)),
  )
  for (let size = 1; size < n; size++)
    for (const S of subsets) {
      if (S.length !== size) continue
      const out = range(n).filter((i) => !S.includes(i))
      if (S.every((s) => out.every((x) => N[s]![x]! > N[x]![s]!)))
        return S.map((i) => c[i]!)
    }
  return c
}

// Those whom whoever beats them by a chain of wins, they beat back by one.
export const schwartz = (c: string[], N: number[][]) => {
  const n = c.length
  const r = N.map((row, i) => row.map((v, j) => v > N[j]![i]!))
  for (const k of range(n))
    for (const i of range(n))
      for (const j of range(n)) r[i]![j] ||= r[i]![k]! && r[k]![j]!
  return c.filter((_, x) =>
    range(n).every((y) => r[y]![x] !== true || r[x]![y] === true),
  )
}

export const condorcet = (c: string[], N: number[][]) =>
  c.find((_, i) =>
    range(c.length).every((j) => i === j || N[i]![j]! > N[j]![i]!),
  )

// First, or last, choices among `race`, on strict ballots.
const choices = (p: RefProfile, race: string[], last = false) => {
  const s = zeros(race)
  for (const b of p.ballots) {
    const order = b.ranking.flat()
    const c = last
      ? order.findLast((x) => race.includes(x))
      : order.find((x) => race.includes(x))
    if (c !== undefined) s[c]! += b.weight
  }
  return s
}
const total = (p: RefProfile) => p.ballots.reduce((a, b) => a + b.weight, 0)
const argBest = (s: Scores, pick: (...v: number[]) => number) => {
  const v = pick(...Object.values(s))
  return Object.keys(s).filter((k) => s[k] === v)
}
const bordaAmong = (p: RefProfile, race: string[]) => {
  const s = zeros(race)
  for (const b of p.ballots) {
    const order = b.ranking.flat().filter((x) => race.includes(x))
    for (const [k, x] of order.entries()) s[x]! += b.weight * (race.length - k)
  }
  return s
}
// Weight ranking x above y, and the rest.
const headToHead = (p: RefProfile, x: string, y: string) => {
  let a = 0
  let b = 0
  for (const ballot of p.ballots) {
    const o = ballot.ranking.flat()
    if (o.indexOf(x) < o.indexOf(y)) a += ballot.weight
    else b += ballot.weight
  }
  return { a, b }
}
const majority = (p: RefProfile) => {
  const f = choices(p, p.candidates)
  return p.candidates.find((x) => f[x]! > total(p) / 2)
}

// Instant runoff from `start`, unless `stop` names the winner first.
const runoff = (
  p: RefProfile,
  start: string[],
  stop?: (race: string[]) => Winner | undefined,
): Winner => {
  let race = start
  for (;;) {
    const s = stop?.(race)
    if (s !== undefined) return s
    if (race.length === 1) return race[0]!
    const lo = argBest(choices(p, race), Math.min)
    if (lo.length > 1) return null
    race = race.filter((x) => x !== lo[0])
  }
}

export const irv = (p: RefProfile) => runoff(p, p.candidates)
export const benham = (p: RefProfile) =>
  runoff(p, p.candidates, (race) =>
    condorcet(race, pairwise({ ...p, candidates: race })),
  )
export const woodall = (p: RefProfile) => {
  const S = smith(p.candidates, pairwise(p))
  return runoff(p, p.candidates, (race) => {
    const left = race.filter((x) => S.includes(x))
    return left.length === 1 ? left[0] : undefined
  })
}
export const smithIrv = (p: RefProfile) =>
  runoff(p, smith(p.candidates, pairwise(p)))
export const tideman = (p: RefProfile, top: 'smith' | 'schwartz'): Winner => {
  let race = p.candidates
  for (;;) {
    const N = pairwise({ ...p, candidates: race })
    race = top === 'smith' ? smith(race, N) : schwartz(race, N)
    if (race.length === 1) return race[0]!
    const lo = argBest(choices(p, race), Math.min)
    if (lo.length > 1) return null
    race = race.filter((x) => x !== lo[0])
    if (race.length === 1) return race[0]!
  }
}
export const coombs = (p: RefProfile): Winner => {
  let race = p.candidates
  for (;;) {
    const f = choices(p, race)
    const maj = race.find((x) => f[x]! > total(p) / 2)
    if (maj) return maj
    if (race.length === 1) return race[0]!
    const hi = argBest(choices(p, race, true), Math.max)
    if (hi.length > 1) return null
    race = race.filter((x) => x !== hi[0])
  }
}
export const baldwin = (p: RefProfile): Winner => {
  let race = p.candidates
  while (race.length > 1) {
    const lo = argBest(bordaAmong(p, race), Math.min)
    if (lo.length > 1) return null
    race = race.filter((x) => x !== lo[0])
  }
  return race[0]!
}
export const nanson = (p: RefProfile): Winner => {
  let race = p.candidates
  while (race.length > 1) {
    const s = bordaAmong(p, race)
    const avg = Object.values(s).reduce((a, b) => a + b, 0) / race.length
    const keep = race.filter((x) => s[x]! > avg)
    if (keep.length === 0) return null
    race = keep
  }
  return race[0]!
}
export const bucklin = (p: RefProfile): Winner => {
  for (let d = 1; d <= p.candidates.length; d++) {
    const s = zeros(p.candidates)
    for (const b of p.ballots)
      for (const x of b.ranking.flat().slice(0, d)) s[x]! += b.weight
    if (Object.values(s).some((v) => v > total(p) / 2)) {
      const w = argBest(s, Math.max)
      return w.length === 1 ? w[0]! : null
    }
  }
  return null
}
// The two with most first choices, unless a tie decides the second.
const topTwo = (p: RefProfile) => {
  const sorted = Object.entries(choices(p, p.candidates)).toSorted(
    (x, y) => y[1] - x[1],
  )
  if (sorted.length > 2 && sorted[1]![1] === sorted[2]![1]) return
  return [sorted[0]![0], sorted[1]![0]] as const
}
export const twoRound = (p: RefProfile): Winner => {
  const maj = majority(p)
  if (maj) return maj
  const t = topTwo(p)
  if (!t) return null
  const { a, b } = headToHead(p, t[0], t[1])
  if (a === b) return null
  return a > b ? t[0] : t[1]
}
export const supplementary = (p: RefProfile, preferences = 2): Winner => {
  const maj = majority(p)
  if (maj) return maj
  const t = topTwo(p)
  if (!t) return null
  let a = 0
  let b = 0
  for (const ballot of p.ballots) {
    const marks = ballot.ranking.flat().slice(0, preferences)
    const v = marks.find((x) => t.includes(x))
    if (v === t[0]) a += ballot.weight
    else if (v === t[1]) b += ballot.weight
  }
  if (a === b) return null
  return a > b ? t[0] : t[1]
}
export const bottomTwo = (p: RefProfile): Winner => {
  let race = p.candidates
  while (race.length > 1) {
    const sorted = Object.entries(choices(p, race)).toSorted(
      (x, y) => x[1] - y[1],
    )
    if (sorted.length > 2 && sorted[1]![1] === sorted[2]![1]) return null
    const x = sorted[0]![0]
    const y = sorted[1]![0]
    const { a, b } = headToHead(p, x, y)
    if (a === b) return null
    const out = a > b ? y : x
    race = race.filter((z) => z !== out)
  }
  return race[0]!
}

// Ballots cast, unranked candidates appended as a last tier.
const completed = (p: RefProfile) =>
  p.ballots
    .filter((b) => b.ranking.flat().length > 0)
    .map((b) => {
      const ranked = new Set(b.ranking.flat())
      const rest = p.candidates.filter((c) => !ranked.has(c))
      return {
        ...b,
        ranking: rest.length > 0 ? [...b.ranking, rest] : b.ranking,
      }
    })
export const fptpScores = (p: RefProfile) => {
  const s = zeros(p.candidates)
  for (const b of completed(p)) {
    const top = b.ranking[0]!
    for (const x of top) s[x]! += b.weight / top.length
  }
  return s
}
export const approvalScores = (p: RefProfile) => {
  const s = zeros(p.candidates)
  for (const b of completed(p)) {
    const top = b.ranking[0]!
    for (const x of top) s[x]! += b.weight
  }
  return s
}
// A tier shares the points of the places it spans.
export const bordaScores = (p: RefProfile) => {
  const n = p.candidates.length
  const s = zeros(p.candidates)
  for (const b of completed(p)) {
    let place = 0
    for (const t of b.ranking) {
      const avg = n - place - (t.length - 1) / 2
      for (const x of t) s[x]! += b.weight * avg
      place += t.length
    }
  }
  return s
}
export const antiPluralityScores = (p: RefProfile) => {
  const s = zeros(p.candidates)
  for (const b of completed(p)) {
    const t = b.ranking.at(-1)!
    for (const x of t) s[x]! -= b.weight / t.length
  }
  return s
}
// Bucklin's last count: a tier across the cut counts its share inside it,
// stopping at a majority of the ballots cast.
export const bucklinScores = (p: RefProfile) => {
  const ballots = completed(p)
  const cast = ballots.reduce((a, b) => a + b.weight, 0)
  let s = zeros(p.candidates)
  for (let d = 1; d <= p.candidates.length; d++) {
    s = zeros(p.candidates)
    for (const b of ballots) {
      let place = 0
      for (const t of b.ranking) {
        const within = Math.min(Math.max(d - place, 0), t.length)
        for (const x of t) s[x]! += (b.weight * within) / t.length
        place += t.length
      }
    }
    if (Object.values(s).some((v) => v > cast / 2 + 1e-6)) break
  }
  return s
}
// A point a win, half a tie.
export const copelandScores = (c: string[], N: number[][]) => {
  const s = zeros(c)
  for (const [i, x] of c.entries())
    for (const j of range(c.length))
      if (i !== j && N[i]![j]! >= N[j]![i]!)
        s[x]! += N[i]![j]! > N[j]![i]! ? 1 : 0.5
  return s
}
// Minus the worst defeat, as the variant measures it.
export const minimaxScores = (c: string[], N: number[][], variant: string) => {
  const defeat = (against: number, pro: number) => {
    if (variant === 'MARGINS') return against - pro
    if (variant === 'WINNING_VOTES') return against > pro ? against : 0
    return against
  }
  return Object.fromEntries(
    c.map((x, i) => [
      x,
      -Math.max(
        ...range(c.length)
          .filter((j) => j !== i)
          .map((j) => defeat(N[j]![i]!, N[i]![j]!)),
      ),
    ]),
  )
}

// Grades by majority grade, each taken out in turn.
const majorityValue = (grades: number[]) => {
  const s = grades.toSorted(byNumber)
  const out: number[] = []
  while (s.length > 0) out.push(...s.splice(Math.floor(s.length / 2), 1))
  return out
}

// Majority judgment: grades 0 (best) to g - 1, unranked worst, one vote
// removed at the majority grade at a time.
export const majorityJudgment = (p: RefProfile, g = 6) => {
  const grades = new Map(p.candidates.map((c) => [c, [] as number[]]))
  for (const b of p.ballots) {
    if (b.ranking.flat().length === 0) continue
    const pos = positions(b)
    for (const c of p.candidates)
      grades.get(c)!.push(...range(b.weight).map(() => pos.get(c) ?? g - 1))
  }
  const values = new Map(
    p.candidates.map((c) => [c, majorityValue(grades.get(c)!)]),
  )
  const cmp = (x: string, y: string) => {
    const a = values.get(x)!
    const b = values.get(y)!
    const k = range(Math.min(a.length, b.length)).find((i) => a[i] !== b[i])
    return k === undefined ? b.length - a.length : a[k]! - b[k]!
  }
  const tiers: string[][] = []
  for (const c of p.candidates.toSorted(cmp)) {
    const t = tiers.at(-1)
    if (t && cmp(t[0]!, c) === 0) t.push(c)
    else tiers.push([c])
  }
  return tiers
}
