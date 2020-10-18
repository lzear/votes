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
import { matrixFromBallots } from './makeMatrix'
import { scoresToRanking } from './scores'

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
}
