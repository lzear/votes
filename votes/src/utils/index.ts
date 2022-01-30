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
