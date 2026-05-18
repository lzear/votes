/* eslint-disable vitest/no-conditional-expect */
import { type MethodCtor, methods } from '../methods'
import { MajorityJudgment } from '../methods/majority-judgment'
import { RandomCandidates } from '../methods/random-candidates'
import { VotingSystem } from '../types'
import {
  isBallotMethod,
  isBallotSystem,
  isMatrixMethod,
  isMatrixSystem,
  isRandomMethod,
  isRandomSystem,
} from './categories'

describe('systems categoris', () => {
  const specialCases = new Set<MethodCtor>([RandomCandidates, MajorityJudgment])
  it.each(Object.values(VotingSystem))(
    'needs ballots xor matrix (%s)',
    (system) => {
      const Method = methods[system]

      if (!specialCases.has(Method))
        expect(Method.needsMatrix !== Method.needsBallot).toBe(true)

      expect(isRandomSystem(system) === isRandomMethod(Method)).toBe(true)
      expect(isBallotSystem(system) === isBallotMethod(Method)).toBe(true)
      expect(isMatrixSystem(system) === isMatrixMethod(Method)).toBe(true)

      expect(isRandomSystem(system) === Method.isRandom).toBe(true)
      expect(isBallotSystem(system) === Method.needsBallot).toBe(true)
      expect(isMatrixSystem(system) === Method.needsMatrix).toBe(true)
    },
  )

  it.each(Object.values(methods))(
    'needs ballots xor matrix 2 (%O)',
    (Method) => {
      if (!specialCases.has(Method))
        expect(Method.needsMatrix !== Method.needsBallot).toBe(true)

      expect(isRandomMethod(Method) === Method.isRandom).toBe(true)
      expect(isBallotMethod(Method) === Method.needsBallot).toBe(true)
      expect(isMatrixMethod(Method) === Method.needsMatrix).toBe(true)
    },
  )

  it('has correct categories', () => {
    const systems = Object.values(VotingSystem)
    const randomSystems = systems.filter((system) => isRandomSystem(system))
    const matrixSystems = systems.filter((system) => isBallotSystem(system))
    const ballotSystems = systems.filter((system) => isMatrixSystem(system))

    expect(randomSystems).toMatchInlineSnapshot(`
      [
        "MAXIMAL_LOTTERIES",
        "RANDOMIZED_CONDORCET",
        "RANDOM_CANDIDATES",
        "RANDOM_DICTATOR",
      ]
    `)
    expect(matrixSystems).toMatchInlineSnapshot(`
      [
        "APPROBATION",
        "ABSOLUTE_MAJORITY",
        "BALDWIN",
        "BORDA",
        "BOTTOM_TWO_RUNOFF",
        "COOMBS",
        "FIRST_PAST_THE_POST",
        "INSTANT_RUNOFF",
        "NANSON",
        "RANDOM_DICTATOR",
        "TWO_ROUND_RUNOFF",
      ]
    `)
    expect(ballotSystems).toMatchInlineSnapshot(`
      [
        "COPELAND",
        "KEMENY",
        "MAXIMAL_LOTTERIES",
        "MINIMAX",
        "MINIMAX_TD",
        "RANDOMIZED_CONDORCET",
        "RANKED_PAIRS",
        "SCHULZE",
        "SMITH",
      ]
    `)
  })
})
