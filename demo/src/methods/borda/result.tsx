import React from 'react'

import { Borda } from 'votes'

import { useStore } from '../../store'
import {
  selectBallots,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'

import { BordaTreeMap } from './viz-borda'

export const VizBorda: React.FC = () => {
  const ballots = useStore(selectBallots)
  const candidatesById = useCandidatesById()
  const candidatesString = useCandidatesString()
  const bordiScores = new Borda({
    ballots,
    candidates: candidatesString,
  }).scores()
  return (
    <>
      <ScoresSummary scores={bordiScores} candidatesById={candidatesById} />

      <h3 level={4}>Visualization</h3>
      <BordaTreeMap />
    </>
  )
}
