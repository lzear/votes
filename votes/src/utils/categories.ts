import type { VotingSystem } from '../types'
import { type Methods, methods } from '../methods'

type MethodsContaining<
  StaticProp extends 'isRandom' | 'needsBallot' | 'needsMatrix',
  Method,
> = Method extends Methods
  ? Method[StaticProp] extends true
    ? Method
    : never
  : never

type SystemsBeing<
  MethodType extends Methods,
  System,
> = System extends VotingSystem
  ? typeof methods[System] extends MethodType
    ? System
    : never
  : never

export type RandomMethods = MethodsContaining<'isRandom', Methods>
export type BallotMethods = MethodsContaining<'needsBallot', Methods>
export type MatrixMethods = MethodsContaining<'needsMatrix', Methods>

export type RandomSystem = SystemsBeing<RandomMethods, VotingSystem>
export type BallotSystem = SystemsBeing<BallotMethods, VotingSystem>
export type MatrixSystem = SystemsBeing<MatrixMethods, VotingSystem>

export const isRandomMethod = (Method: Methods): Method is RandomMethods =>
  Method.isRandom
export const isBallotMethod = (Method: Methods): Method is BallotMethods =>
  Method.needsBallot
export const isMatrixMethod = (Method: Methods): Method is MatrixMethods =>
  Method.needsMatrix

export const isRandomSystem = (system: VotingSystem): system is RandomSystem =>
  isRandomMethod(methods[system])
export const isBallotSystem = (system: VotingSystem): system is BallotSystem =>
  isBallotMethod(methods[system])
export const isMatrixSystem = (system: VotingSystem): system is MatrixSystem =>
  isMatrixMethod(methods[system])
