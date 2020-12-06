import {
  normalizeRanking,
  normalizeBallot,
  normalizeBallots,
  groupBallots,
  candidatesFromBallots,
  normalizeRankinput,
  toWeightedBallots,
  removeInvalidCandidates,
  removeDuplicatedCandidates,
  checkDuplicatedCandidate,
} from './normalize'
import { makeAntisymetric, matrixFromBallots } from './makeMatrix'
import { scoresFromBallots, scoresToRanking } from './scores'

export {
  normalizeRanking,
  normalizeBallot,
  normalizeBallots,
  groupBallots,
  candidatesFromBallots,
  normalizeRankinput,
  toWeightedBallots,
  removeInvalidCandidates,
  removeDuplicatedCandidates,
  checkDuplicatedCandidate,
  matrixFromBallots,
  scoresToRanking,
  makeAntisymetric,
  scoresFromBallots,
}
