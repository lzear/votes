import React, { useRef } from 'react'

import { RandomizedCondorcet } from 'votes'

import { CandiTagList } from '../../candidates'
import { useStore } from '../../store'
import { selectMatrix, useCandidatesById } from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'

export const VizRandomizedCondorcet: React.FC = () => {
  const matrix = useStore(selectMatrix)
  const randomizedCondorcet = new RandomizedCondorcet(matrix)

  const candidatesById = useCandidatesById()
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="container" ref={ref}>
      <p>Maximal Lotteries</p>
      <CandiTagList
        candidates={randomizedCondorcet.candidates.map(
          (c) => candidatesById[c],
        )}
      />
      <br />
      <ScoresSummary
        scores={randomizedCondorcet.scores()}
        candidatesById={candidatesById}
      />
    </div>
  )
}
