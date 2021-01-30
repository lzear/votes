import {
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
import { makeAntisymetric, matrixFromBallots } from './makeMatrix'
import { scoresToRanking } from './scores'
import { scoresFromBallots } from './scoresFromBallots'

export {
  normalizeRanking,
  normalizeBallot,
  normalizeBallots,
  groupBallots,
  candidatesFromBallots,
  normalizeRankInput,
  toWeightedBallots,
  removeInvalidCandidates,
  removeDuplicatedCandidates,
  checkDuplicatedCandidate,
  matrixFromBallots,
  scoresToRanking,
  makeAntisymetric,
  scoresFromBallots,
}
