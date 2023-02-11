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
import { H4 } from '../../layout/headings'

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

      <H4>Visualization</H4>
      <BordaTreeMap />
    </>
  )
}
