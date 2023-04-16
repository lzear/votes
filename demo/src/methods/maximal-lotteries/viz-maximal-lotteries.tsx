import React, { useRef } from 'react'

import { MaximalLotteries } from 'votes'

import { CandiTagList } from '../../candidates'
import { useStore } from '../../store'
import { selectMatrix, useCandidatesById } from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'

export const VizMaximalLotteries: React.FC = () => {
  const matrix = useStore(selectMatrix)
  const maximalLotteries = new MaximalLotteries(matrix)

  const candidatesById = useCandidatesById()
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="container" ref={ref}>
      <p>Maximal Lotteries</p>
      <CandiTagList
        candidates={maximalLotteries.candidates.map((c) => candidatesById[c])}
      />
      <br />
      <ScoresSummary
        scores={maximalLotteries.scores()}
        candidatesById={candidatesById}
      />
    </div>
  )
}
