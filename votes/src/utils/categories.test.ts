import { VotingSystem } from '../types'
import { methods } from '../methods'
import {
  isBallotMethod,
  isBallotSystem,
  isMatrixMethod,
  isMatrixSystem,
  isRandomMethod,
  isRandomSystem,
} from './categories'
import { RandomCandidates } from '../methods/random-candidates'

describe('systems categoris', () => {
  it.each(Object.values(VotingSystem))('needs ballots xor matrix', (system) => {
    const Method = methods[system]

    if (system !== VotingSystem.RandomCandidates)
      expect(Method.needsMatrix !== Method.needsBallot).toBe(true)

    expect(isRandomSystem(system) === isRandomMethod(Method)).toBe(true)
    expect(isBallotSystem(system) === isBallotMethod(Method)).toBe(true)
    expect(isMatrixSystem(system) === isMatrixMethod(Method)).toBe(true)

    expect(isRandomSystem(system) === Method.isRandom).toBe(true)
    expect(isBallotSystem(system) === Method.needsBallot).toBe(true)
    expect(isMatrixSystem(system) === Method.needsMatrix).toBe(true)
  })

  it.each(Object.values(methods))('needs ballots xor matrix 2', (Method) => {
    if (Method !== RandomCandidates)
      expect(Method.needsMatrix !== Method.needsBallot).toBe(true)

    expect(isRandomMethod(Method) === Method.isRandom).toBe(true)
    expect(isBallotMethod(Method) === Method.needsBallot).toBe(true)
    expect(isMatrixMethod(Method) === Method.needsMatrix).toBe(true)
  })

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
        "MAJORITY_JUDGEMENT",
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
        "RANDOMIZED_CONDORCET",
        "RANKED_PAIRS",
        "SCHULZE",
      ]
    `)
  })
})
