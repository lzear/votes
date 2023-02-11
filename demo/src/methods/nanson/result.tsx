import React from 'react'
import _ from 'lodash'
import {
  selectBallots,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { useStore } from '../../store'
import { totalWeight } from '../../generate-ballots'
import { ScoresSummary } from '../viz/scores-summary'
import { Borda } from 'votes'
import { VizNansonTreemap } from './viz-nanson'

export const VizNanson: React.FC = () => {
  const ballots = useStore(selectBallots)
  const candidatesById = useCandidatesById()
  const candidatesString = useCandidatesString()
  const bordiScores = new Borda({
    ballots,
    candidates: candidatesString,
  }).scores()

  const tot = totalWeight(ballots)
  const bordiScores2 = _.mapValues(bordiScores, (s) => s + tot)
  return (
    <>
      <ScoresSummary scores={bordiScores2} candidatesById={candidatesById} />
      <VizNansonTreemap />
    </>
  )
}