import React, { useRef } from 'react'

import { MinimaxTD, utils as voteUtils } from 'votes'

import { CandiTagList } from '../../candidates'
import { useStore } from '../../store'
import { selectMatrix, useCandidatesById } from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'

export const VizMinimaxTD: React.FC = () => {
  const matrix = useStore(selectMatrix)
  const candidatesById = useCandidatesById()
  const minimax = new MinimaxTD(matrix)
  const smith = voteUtils.findSmithSet(matrix)
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="container" ref={ref}>
      <p>Smith set</p>
      <CandiTagList
        candidates={smith.candidates.map((c) => candidatesById[c])}
      />
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
