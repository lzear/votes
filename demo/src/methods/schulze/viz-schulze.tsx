import React, { useRef } from 'react'

import { Schulze } from 'votes'

import { CandiTagList } from '../../candidates'
import { useStore } from '../../store'
import { selectMatrix, useCandidatesById } from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'

export const VizSchulze: React.FC = () => {
  const matrix = useStore(selectMatrix)
  const schulze = new Schulze(matrix)

  const candidatesById = useCandidatesById()
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="container" ref={ref}>
      <p>Maximal Lotteries</p>
      <CandiTagList
        candidates={schulze.candidates.map((c) => candidatesById[c])}
      />
      <br />
      <ScoresSummary
        scores={schulze.scores()}
        candidatesById={candidatesById}
      />
    </div>
  )
}
