import React from 'react'
import {
  selectBallots,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { useStore } from '../../store'
import { ScoresSummary } from '../viz/scores-summary'
import { Borda } from 'votes'
import { BordaTreeMap } from './viz-borda'
import { Typography } from 'antd'

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
