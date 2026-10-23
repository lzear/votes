// Reference implementations, written from each method's definition rather
// than the library's code, for differential checks (`../reference.test.ts`).
// Strict profiles hold complete strict ballots; tied ones, ties and truncated
// ballots, unranked candidates tied last; optioned ones, blank ballots too,
// fractional and zero weights, and random `unrankedLast` and `countBlank`.
import { shuffleArray } from '../utils/shuffle-array'

export type RefBallot = { ranking: string[][]; weight: number }
export type RefProfile = {
  candidates: string[]
  ballots: RefBallot[]
  unrankedLast?: boolean
  countBlank?: boolean
}
type Scores = Record<string, number>

const NAMES = ['a', 'b', 'c', 'd', 'e', 'f']
const WEIGHTS = [0, 0.1, 0.2, 0.25, 0.5, 1, 1.5, 3]

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
  const tiedRanking = (candidates: string[]) => {
    const ranked = shuffleArray(candidates, rng).slice(
      0,
      1 + int(candidates.length),
    )
    const ranking: string[][] = []
    for (const c of ranked) {
      const tier = ranking.at(-1)
      if (tier && rng() < 0.3) tier.push(c)
      else ranking.push([c])
    }
    return ranking
  }
  const tied = (n: number, voters: number): RefProfile => {
    const candidates = NAMES.slice(0, n)
    return {
      candidates,
      ballots: Array.from({ length: voters }, () => ({
        ranking: tiedRanking(candidates),
        weight: 1 + int(4),
      })),
    }
  }
  const optioned = (n: number, voters: number): RefProfile => {
    const candidates = NAMES.slice(0, n)
    return {
      candidates,
      ballots: Array.from({ length: voters }, () => ({
        ranking: rng() < 0.1 ? [] : tiedRanking(candidates),
        weight: WEIGHTS[int(WEIGHTS.length)]!,
      })),
      unrankedLast: rng() < 0.5,
      countBlank: rng() < 0.5,
    }
  }
  return { int, strict, tied, optioned }
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

// `x` on a 1e-9 grid, so that float noise ties as exact sums would.
const grid = (x: number) => Math.round(x * 1e9) / 1e9

// N[i][j]: weight ranking i above j, unranked tied last with `unrankedLast`
// (the default), else not compared.
export const pairwise = ({
  candidates,
  ballots,
  unrankedLast = true,
}: RefProfile): number[][] => {
  const n = candidates.length
  const unranked = unrankedLast ? Infinity : NaN
  const N = range(n).map(() => range(n).map(() => 0))
  for (const b of ballots) {
    const pos = positions(b)
    for (const i of range(n))
      for (const j of range(n)) {
        const pi = pos.get(candidates[i]!) ?? unranked
        const pj = pos.get(candidates[j]!) ?? unranked
        if (pi < pj) N[i]![j]! += b.weight
      }
  }
  return N.map((row) => row.map((v) => grid(v)))
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
      return strength === 'margins' ? grid(v - N[j]![i]!) : v
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
      const v = strength === 'margins' ? grid(N[f]![t]! - N[t]![f]!) : N[f]![t]!
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
  const m = (i: number, j: number) => grid(N[i]![j]! - N[j]![i]!)
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
    idx
      .filter((b) => b !== a)
      .map((b) => ({ a, b, m: grid(N[a]![b]! - N[b]![a]!) })),
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

// The ballots as the methods read them: with `unrankedLast`, those ranking
// someone rank the rest tied last.
const read = (p: RefProfile) =>
  p.ballots.map((b) => {
    const ranked = new Set(b.ranking.flat())
    const rest = p.candidates.filter((c) => !ranked.has(c))
    return p.unrankedLast !== false && ranked.size > 0 && rest.length > 0
      ? { ...b, ranking: [...b.ranking, rest] }
      : b
  })
// Each ballot's tiers among `race`, empty ones dropped.
const among = (p: RefProfile, race: string[]) =>
  read(p).map((b) => ({
    ...b,
    ranking: b.ranking
      .map((t) => t.filter((c) => race.includes(c)))
      .filter((t) => t.length > 0),
  }))
const weightOf = (ballots: RefBallot[]) =>
  ballots.reduce((a, b) => a + b.weight, 0)
// The weight of the ballots cast in a race: blank ones only with `countBlank`.
const cast = (p: RefProfile, race: string[]) =>
  weightOf(
    p.countBlank === true
      ? p.ballots
      : among(p, race).filter((b) => b.ranking.length > 0),
  )
// First choices among `race`, a tier sharing its ballot's weight; or last
// choices, on the ballots ranking all of `race`.
const choices = (p: RefProfile, race: string[], last = false) => {
  const s = zeros(race)
  for (const b of among(p, race)) {
    if (last && b.ranking.flat().length < race.length) continue
    const t = (last ? b.ranking.at(-1) : b.ranking[0]) ?? []
    for (const x of t) s[x]! += b.weight / t.length
  }
  return Object.fromEntries(Object.entries(s).map(([c, v]) => [c, grid(v)]))
}
const argBest = (s: Scores, pick: (...v: number[]) => number) => {
  const v = pick(...Object.values(s))
  return Object.keys(s).filter((k) => s[k] === v)
}
const majority = (p: RefProfile, race: string[]) => {
  const f = choices(p, race)
  return race.find((x) => f[x]! > grid(cast(p, race) / 2))
}
// Margins summed over the rest of `race`: Borda scores, less a constant.
const marginSums = (p: RefProfile, race: string[]) => {
  const N = pairwise({ ...p, candidates: race })
  return Object.fromEntries(
    race.map((x, i) => [
      x,
      grid(N[i]!.reduce((a, v, j) => a + v - N[j]![i]!, 0)),
    ]),
  )
}

// What a round leaves: the winners, or the races one way of breaking its
// ties leads to each.
type Step = { win: string[] } | { next: string[][] }
const without = (race: string[], out: string[]): Step => ({
  next: out.map((x) => race.filter((y) => y !== x)),
})

// Those who win from `start` in some order of breaking the ties, trying
// every order.
const search = (start: string[], step: (race: string[]) => Step) => {
  const memo = new Map<string, Set<string>>()
  const visit = (race: string[]): Set<string> => {
    if (race.length <= 1) return new Set(race)
    const key = race.join(',')
    const known = memo.get(key)
    if (known) return known
    const s = step(race)
    const w = new Set('win' in s ? s.win : s.next.flatMap((r) => [...visit(r)]))
    memo.set(key, w)
    return w
  }
  return [...visit(start)]
}

// Each round, the fewest first choices goes out.
const irvStep = (p: RefProfile) => (race: string[]) =>
  without(race, argBest(choices(p, race), Math.min))

export const irv = (p: RefProfile) => search(p.candidates, irvStep(p))
export const benham = (p: RefProfile) =>
  search(p.candidates, (race) => {
    const w = condorcet(race, pairwise({ ...p, candidates: race }))
    return w === undefined ? irvStep(p)(race) : { win: [w] }
  })
export const woodall = (p: RefProfile) => {
  const S = smith(p.candidates, pairwise(p))
  return search(p.candidates, (race) => {
    const left = race.filter((x) => S.includes(x))
    return left.length === 1 ? { win: left } : irvStep(p)(race)
  })
}
export const smithIrv = (p: RefProfile) =>
  search(smith(p.candidates, pairwise(p)), irvStep(p))
// The top set of the race left, and when it holds them all, instant runoff.
export const tideman = (p: RefProfile, top: 'smith' | 'schwartz') =>
  search(p.candidates, (race) => {
    const N = pairwise({ ...p, candidates: race })
    const kept = top === 'smith' ? smith(race, N) : schwartz(race, N)
    return kept.length < race.length ? { next: [kept] } : irvStep(p)(race)
  })
export const coombs = (p: RefProfile) =>
  search(p.candidates, (race) => {
    const w = majority(p, race)
    return w === undefined
      ? without(race, argBest(choices(p, race, true), Math.max))
      : { win: [w] }
  })
export const baldwin = (p: RefProfile) =>
  search(p.candidates, (race) =>
    without(race, argBest(marginSums(p, race), Math.min)),
  )
// Those above the average Borda score stay, everyone if no one is above.
export const nanson = (p: RefProfile) =>
  search(p.candidates, (race) => {
    const s = marginSums(p, race)
    const kept = race.filter((x) => s[x]! > 0)
    return kept.length > 0 ? { next: [kept] } : { win: race }
  })
// The bottom two on first choices, a tie split by first choices among the
// tied, or all tied with them; then the fewest first choices among them.
export const bottomTwo = (p: RefProfile) =>
  search(p.candidates, (race) => {
    const tiers = (xs: string[]) => {
      const s = choices(p, xs)
      return [...new Set(Object.values(s))]
        .toSorted((x, y) => y - x)
        .map((v) => xs.filter((x) => s[x] === v))
    }
    const ranked = tiers(race).flatMap((t) => (t.length > 1 ? tiers(t) : [t]))
    const last = ranked.at(-1)!
    const pending = last.length >= 2 ? last : [...last, ...ranked.at(-2)!]
    return without(race, argBest(choices(p, pending), Math.min))
  })
// A majority wins; else every pair with the most first choices, in some
// order of breaking ties, goes to a runoff, both winning a tied one.
export const twoRound = (p: RefProfile) => {
  const race = p.candidates
  const w = majority(p, race)
  if (w !== undefined) return [w]
  const f = choices(p, race)
  const pairs = race.flatMap((x, i) =>
    race
      .slice(i + 1)
      .map((y) => [x, y])
      .filter((pair) => {
        const low = Math.min(...pair.map((c) => f[c]!))
        return race.every((c) => pair.includes(c) || f[c]! <= low)
      }),
  )
  return [
    ...new Set(pairs.flatMap((pair) => argBest(choices(p, pair), Math.max))),
  ]
}
// Two-round runoff on the tiers that start within each ballot's first
// `preferences` places.
export const supplementary = (p: RefProfile, preferences = 2) =>
  twoRound({
    ...p,
    unrankedLast: false,
    ballots: p.ballots.map((b) => {
      let place = 0
      return {
        ...b,
        ranking: b.ranking.filter((t) => {
          const kept = place < preferences
          place += t.length
          return kept
        }),
      }
    }),
  })
// The most votes on Bucklin's last count.
export const bucklin = (p: RefProfile) => argBest(bucklinScores(p), Math.max)

const nonBlank = (p: RefProfile) => read(p).filter((b) => b.ranking.length > 0)
export const fptpScores = (p: RefProfile) => choices(p, p.candidates)
export const approvalScores = (p: RefProfile) => {
  const s = zeros(p.candidates)
  for (const b of nonBlank(p)) {
    const top = b.ranking[0]!
    for (const x of top) s[x]! += b.weight
  }
  return s
}
// A tier shares the points of the places it spans; unranked, none.
export const bordaScores = (p: RefProfile) => {
  const n = p.candidates.length
  const s = zeros(p.candidates)
  for (const b of read(p)) {
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
  const s = choices(p, p.candidates, true)
  return Object.fromEntries(Object.entries(s).map(([c, v]) => [c, -v]))
}
// Bucklin's last count: a tier across the cut counts its share inside it,
// stopping at a majority of the ballots cast.
export const bucklinScores = (p: RefProfile) => {
  const half = grid(cast(p, p.candidates) / 2)
  let s = zeros(p.candidates)
  for (let d = 1; d <= p.candidates.length; d++) {
    s = zeros(p.candidates)
    for (const b of read(p)) {
      let place = 0
      for (const t of b.ranking) {
        const within = Math.min(Math.max(d - place, 0), t.length)
        for (const x of t) s[x]! += (b.weight * within) / t.length
        place += t.length
      }
    }
    s = Object.fromEntries(Object.entries(s).map(([c, v]) => [c, grid(v)]))
    if (Object.values(s).some((v) => v > half)) break
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
// Minus the worst defeat, as the variant measures it, with `excludeTies` over
// the duels not tied unless all are.
export const minimaxScores = (
  c: string[],
  N: number[][],
  variant: string,
  excludeTies = false,
) => {
  const defeat = (against: number, pro: number) => {
    if (variant === 'MARGINS') return against - pro
    if (variant === 'WINNING_VOTES') return against > pro ? against : 0
    return against
  }
  return Object.fromEntries(
    c.map((x, i) => {
      const duels = range(c.length).filter((j) => j !== i)
      const untied = duels.filter((j) => N[j]![i] !== N[i]![j])
      const counted = excludeTies && untied.length > 0 ? untied : duels
      return [x, -Math.max(...counted.map((j) => defeat(N[j]![i]!, N[i]![j]!)))]
    }),
  )
}

// Grades by majority grade, each taken out in turn.
const majorityValue = (grades: number[]) => {
  const s = grades.toSorted(byNumber)
  const out: number[] = []
  while (s.length > 0) out.push(...s.splice(Math.floor(s.length / 2), 1))
  return out
}

// Majority judgment: grades 0 (best) to g - 1, a tier's index its grade or
// with `clampGrades` the worst past it, unranked worst with `unrankedLast`,
// blank ballots counted with `countBlank`; one vote removed at the majority
// grade at a time, on whole weights.
const gradesGiven = (p: RefProfile, g: number, clampGrades: boolean) => {
  const worst = clampGrades ? g - 1 : Infinity
  const unranked = p.unrankedLast === false ? [] : [g - 1]
  const grades = new Map(p.candidates.map((c) => [c, [] as number[]]))
  for (const b of p.ballots) {
    if (b.ranking.flat().length === 0 && p.countBlank !== true) continue
    const pos = positions(b)
    for (const c of p.candidates) {
      const at = pos.get(c)
      const given = at === undefined ? unranked : [Math.min(at, worst)]
      for (const x of given) grades.get(c)!.push(...range(b.weight).fill(x))
    }
  }
  return grades
}
export const majorityJudgment = (
  p: RefProfile,
  { grades: g = 6, clampGrades = false } = {},
) => {
  const grades = gradesGiven(p, g, clampGrades)
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
