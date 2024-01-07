import React from 'react'
import _ from 'lodash-es'

import { Borda } from 'votes'

import { totalWeight } from '../../generate-ballots'
import { useStore } from '../../store'
import {
  selectBallots,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'

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
