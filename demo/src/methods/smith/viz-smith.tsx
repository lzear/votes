import React, { useRef } from 'react'

import { Smith } from 'votes'

import { CandiTagList } from '../../candidates'
import { useStore } from '../../store'
import { selectMatrix, useCandidatesById } from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'

export const VizSmith: React.FC = () => {
  const matrix = useStore(selectMatrix)
  const candidatesById = useCandidatesById()
  const smith = new Smith(matrix)
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="container" ref={ref}>
      <p>Smith set</p>
      <CandiTagList
        candidates={smith.candidates.map((c) => candidatesById[c])}
      />
      <p>
        Winners are the Smith set: &ldquo;the smallest non-empty set of
        candidates in a particular election such that each member defeats every
        candidate outside the set in a pairwise election&rdquo;
      </p>
      <br />
      <ScoresSummary scores={smith.scores()} candidatesById={candidatesById} />
    </div>
  )
}
