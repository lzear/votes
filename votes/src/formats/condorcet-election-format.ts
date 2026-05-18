import type { Ballot } from '../types'
import { removeDuplicatedCandidates, removeInvalidCandidates } from '../utils'

export interface ParsedCondorcetElection<C extends string> {
  candidates: C[]
  ballots: Ballot<C>[]
}

interface ParsedParams<C extends string> {
  candidates: C[]
  implicitRanking: boolean
  weightAllowed: boolean
  voteLines: string[]
}

const parseParamLine = <C extends string>(
  line: string,
  state: ParsedParams<C>,
): void => {
  const colonIdx = line.indexOf(':', 2)
  if (colonIdx === -1) return
  const paramName = line.slice(2, colonIdx).trim().toLowerCase()
  const paramValue = line.slice(colonIdx + 1).trim()

  switch (paramName) {
    case 'candidates': {
      state.candidates = paramValue
        .split(';')
        .map((c) => c.trim())
        .filter((c) => c.length > 0) as C[]
      break
    }
    case 'implicit ranking': {
      state.implicitRanking = paramValue.toLowerCase() === 'true'
      break
    }
    case 'weight allowed': {
      state.weightAllowed = paramValue.toLowerCase() === 'true'
      // No default
      break
    }
  }
}

const collectLines = <C extends string>(input: string): ParsedParams<C> => {
  const state: ParsedParams<C> = {
    candidates: [],
    implicitRanking: true,
    weightAllowed: false,
    voteLines: [],
  }

  for (const rawLine of input.split('\n')) {
    const line = rawLine.trimEnd()
    if (line.startsWith('#/')) {
      parseParamLine(line, state)
      continue
    }
    if (line.trimStart().startsWith('#') || line.trim() === '') continue
    const commentIdx = line.indexOf('#')
    const voteLine =
      commentIdx === -1 ? line : line.slice(0, commentIdx).trimEnd()
    if (voteLine.trim()) state.voteLines.push(voteLine.trim())
  }

  return state
}

const stripQuantifierAndWeight = (
  rawLine: string,
  weightAllowed: boolean,
): { line: string; weight: number } => {
  let line = rawLine

  let quantifier = 1
  const quantifierMatch = / \* (\d+(?:\.\d+)?)$/.exec(line)
  if (quantifierMatch?.[1]) {
    quantifier = Number.parseFloat(quantifierMatch[1])
    line = line.slice(0, line.length - quantifierMatch[0].length).trim()
  }

  let voteWeight = 1
  const weightMatch = / \^(\d+(?:\.\d+)?)$/.exec(line)
  if (weightMatch?.[1]) {
    voteWeight = Number.parseFloat(weightMatch[1])
    line = line.slice(0, line.length - weightMatch[0].length).trim()
  }

  return { line, weight: quantifier * (weightAllowed ? voteWeight : 1) }
}

const parseRanking = <C extends string>(line: string): C[][] =>
  line
    .split('>')
    .map((rank) =>
      rank
        .split('=')
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
    )
    .filter((rank) => rank.length > 0) as C[][]

const withImplicitRanking = <C extends string>(
  ranking: C[][],
  candidates: C[],
): C[][] => {
  const ranked = new Set(ranking.flat())
  const missing = candidates.filter((c) => !ranked.has(c))
  return missing.length > 0 ? [...ranking, missing] : ranking
}

const buildBallot = <C extends string = string>(
  rawVote: string,
  { candidates, implicitRanking, weightAllowed }: ParsedParams<C>,
): Ballot<C> | null => {
  const tagSepIdx = rawVote.indexOf('||')
  const stripped =
    tagSepIdx === -1 ? rawVote : rawVote.slice(tagSepIdx + 2).trim()

  const { line, weight } = stripQuantifierAndWeight(stripped, weightAllowed)
  if (weight <= 0) return null

  let ranking: C[][] =
    line === '/EMPTY_RANKING/'
      ? implicitRanking && candidates.length > 0
        ? [[...candidates]]
        : []
      : parseRanking(line)

  if (candidates.length > 0)
    ranking = removeInvalidCandidates(ranking, candidates)
  ranking = removeDuplicatedCandidates(ranking)
  if (implicitRanking && candidates.length > 0)
    ranking = withImplicitRanking(ranking, candidates)

  return { ranking, weight }
}

const deriveCandidates = <C extends string>(ballots: Ballot<C>[]): C[] => {
  const seen = new Set<C>()
  for (const ballot of ballots)
    for (const rank of ballot.ranking) for (const c of rank) seen.add(c)
  return [...seen]
}

export const parseCondorcetElectionFormat = <C extends string = string>(
  input: string,
): ParsedCondorcetElection<C> => {
  const params = collectLines<C>(input)
  const ballots = params.voteLines
    .map((line) => buildBallot(line, params))
    .filter((b): b is Ballot<C> => b !== null)

  const candidates =
    params.candidates.length > 0 ? params.candidates : deriveCandidates(ballots)

  return { candidates, ballots }
}

const serializeRanking = (ranking: string[][]): string =>
  ranking.map((rank) => rank.join(' = ')).join(' > ')

const stripImplicitRank = <C extends string>(
  ranking: C[][],
  candidates: C[],
): C[][] => {
  if (ranking.length === 0) return ranking
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastRank = ranking.at(-1)!
  const ranked = new Set(ranking.slice(0, -1).flat())
  const missing = candidates.filter((c) => !ranked.has(c))
  if (
    missing.length === lastRank.length &&
    missing.every((c) => lastRank.includes(c))
  )
    return ranking.slice(0, -1)
  return ranking
}

export const stringifyCondorcetElectionFormat = <C extends string>(
  { candidates, ballots }: ParsedCondorcetElection<C>,
  { implicitRanking = true }: { implicitRanking?: boolean } = {},
): string => {
  const lines = [
    `#/Candidates: ${candidates.join('; ')}`,
    `#/Implicit Ranking: ${String(implicitRanking)}`,
    '',
  ]

  for (const { ranking, weight } of ballots) {
    const r = implicitRanking ? stripImplicitRank(ranking, candidates) : ranking
    const rankStr = r.length === 0 ? '/EMPTY_RANKING/' : serializeRanking(r)
    lines.push(weight === 1 ? rankStr : `${rankStr} * ${weight}`)
  }

  return lines.join('\n')
}
