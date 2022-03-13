/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Store, useStore } from '.'
import { rainbow } from '../traffic-color'
import { utils } from 'votes'
import _ from 'lodash'

const { matrixFromBallots, makeAntisymetric } = utils

// // light
// const rBow = (n: number) => rainbow(n, 42, 74)

// dark
const rBow = (n: number) => rainbow(n, 76, 41)

export const selectMethod = (store: Store) => store.method
export const selectSetMethod = (store: Store) => store.setMethod
export const selectBallots = (store: Store) => store.ballots
const selectCandidatesString = (store: Store) => store.candidates

export const useCandidatesString = () =>
  useStore(selectCandidatesString, (a, b) => a.length === b.length)

export const useCandidates = () => {
  const candidates = useCandidatesString()
  const colors = rBow(candidates.length)
  return candidates.map((id, idx) => ({
    id,
    color: colors[idx],
  }))
}

export const useCandidatesById = () => {
  const candidates = useCandidatesString()
  const colors = rBow(candidates.length)
  return _.zipObject(
    candidates,
    candidates.map((id, idx) => ({
      id,
      color: colors[idx],
      // highlighted: store.highlightedCandidates?.includes(id),
    })),
  )
}

export const selectSetHighlightCandidates = (store: Store) =>
  store.setHighlightedCandidates
export const selectHighlightedCandidates = (store: Store) =>
  store.highlightedCandidates
export const selectNormalizeWeights100 = (store: Store) =>
  store.normalizeWeights100
// export const selectMergeBallots = (store: Store) => store.mergeBallots
export const selectUpdateCandidateCount = (store: Store) =>
  store.updateCandidateCount
export const selectRemoveCandidate = (store: Store) => store.removeCandidate
export const selectAddCandidate = (store: Store) => store.addCandidate
export const selectChangeBallotWeight = (store: Store) =>
  store.changeBallotWeight
export const selectChangeBallotRanking = (store: Store) =>
  store.changeBallotRanking
export const selectAddRandomBallot = (store: Store) => store.addRandomBallot
export const selectSetPremade = (store: Store) => store.setPremade
export const selectSetWidth = (store: Store) => store.setWidth
export const selectWidth = (store: Store) => store.width
export const selectSelectBallot = (store: Store) => store.selectBallot
export const selectSelectedBallot = (store: Store) =>
  (store.selectedBallotId &&
    store.ballots.find((b) => b.id === store.selectedBallotId)) ||
  null

export const selectMatrix = ({ ballots, candidates }: Store) =>
  makeAntisymetric(matrixFromBallots(ballots, candidates))

export const selectCandidatesColors = ({ candidates }: Store) => {
  const colors = rBow(candidates.length)
  const colorsByCandidate: { [candidate: string]: string } = {}
  for (const [idx, candidate] of candidates.entries())
    colorsByCandidate[candidate] = colors[idx]
  return colorsByCandidate
}

export const useCandidatesColors = () => {
  const candidates = useStore(
    selectCandidatesString,
    (a, b) => a.length === b.length,
  )

  const colors = rBow(candidates.length)
  const colorsByCandidate: { [candidate: string]: string } = {}
  for (const [idx, candidate] of candidates.entries())
    colorsByCandidate[candidate] = colors[idx]
  return colorsByCandidate
}
