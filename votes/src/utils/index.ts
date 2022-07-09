export {
  candidatesFromBallots,
  checkDuplicatedCandidate,
  groupBallots,
  normalizeBallot,
  normalizeBallots,
  normalizeRankInput,
  normalizeRanking,
  removeDuplicatedCandidates,
  removeInvalidCandidates,
  toWeightedBallots,
} from './normalize'
export { makeAntisymetric, matrixFromBallots } from './make-matrix'
export { scoresToRanking } from './scores'
export { generateAcyclicGraph } from '../methods/ranked-pairs/generate-acyclic-graph'
export {
  isMatrixSystem,
  isBallotSystem,
  isRandomSystem,
  isRandomMethod,
  isMatrixMethod,
  isBallotMethod,
} from './categories'
export type {
  BallotSystem,
  BallotMethods,
  MatrixSystem,
  RandomMethods,
  RandomSystem,
  MatrixMethods,
} from './categories'
