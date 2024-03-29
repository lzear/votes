import React, { useMemo } from 'react'

import { InstantRunoff } from 'votes'

import { DisplayBallots } from '../../display-ballots'
import { useStore } from '../../store'
import { selectBallots, useCandidatesString } from '../../store/selectors'

import { VizRoundsBallots } from './viz-rounds'

export const VizInstantRunoff: React.FC = () => {
  const _ballots = useStore(selectBallots)
  const candidatesStrings = useCandidatesString()

  const [rounds] = useMemo(() => {
    const rounds = new InstantRunoff({
      ballots: _ballots,
      candidates: candidatesStrings,
    }).computeRounds()
    return [rounds]
  }, [_ballots, candidatesStrings])

  return <VizRoundsBallots rounds={rounds} displayer={DisplayBallots} />
}

export default VizInstantRunoff
