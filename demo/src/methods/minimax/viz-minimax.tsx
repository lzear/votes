import React, { useRef } from 'react'
import { useStore } from '../../store'
import { selectMatrix, useCandidatesById } from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'
import { Minimax } from 'votes'

export const VizMinimax: React.FC = () => {
  const matrix = useStore(selectMatrix)
  const candidatesById = useCandidatesById()
  const minimax = new Minimax(matrix)
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="container" ref={ref}>
      <p>
        In this example, the (negative) scores show how much each
        candidate&apos;s worst defeat is, compared to the winner.
      </p>
      <br />
      <ScoresSummary
        scores={minimax.scores()}
        candidatesById={candidatesById}
      />
    </div>
  )
}
