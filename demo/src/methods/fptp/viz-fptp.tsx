import React, { useLayoutEffect, useRef, useState } from 'react'

import { FirstPastThePost } from 'votes'

import { DisplayBallots } from '../../display-ballots'
import { useStore } from '../../store'
import {
  selectBallots,
  selectWidth,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'

export const VizFptp: React.FC = () => {
  const ballots = useStore(selectBallots)
  const candidatesById = useCandidatesById()
  const candidatesStrings = useCandidatesString()
  const width = useStore(selectWidth)

  const firstPastThePost = new FirstPastThePost({
    ballots,
    candidates: candidatesStrings,
  })

  const [divWidth, setDivWidth] = useState<null | number>(null)
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (ref.current) setDivWidth(ref.current.offsetWidth)
  }, [width])
  return (
    <div className="container" ref={ref}>
      <ScoresSummary
        scores={firstPastThePost.scores()}
        candidatesById={candidatesById}
      />
      {divWidth && candidatesStrings.length > 2 && (
        <DisplayBallots
          ballots={ballots}
          containerWidth={divWidth}
          candidates={Object.keys(candidatesById)}
        />
      )}
    </div>
  )
}

export default VizFptp
