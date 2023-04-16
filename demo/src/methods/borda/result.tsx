import React from 'react'
import { Typography } from 'antd'

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

      <Typography.Title level={4}>Visualization</Typography.Title>
      <BordaTreeMap />
    </>
  )
}
