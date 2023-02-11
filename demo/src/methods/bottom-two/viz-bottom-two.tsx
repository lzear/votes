import React, { useMemo } from 'react'
import { useStore } from '../../store'
import { selectBallots, useCandidatesString } from '../../store/selectors'
import { BottomTwoRunoff } from 'votes/src'
import { VizRoundsBallots } from '../instant-runoff/viz-rounds'
import { DisplayBallots } from '../../display-ballots'

export const VizBottomTwo: React.FC = () => {
  const _ballots = useStore(selectBallots)
  const candidatesStrings = useCandidatesString()

  const [rounds] = useMemo(() => {
    const rounds = new BottomTwoRunoff({
      ballots: _ballots,
      candidates: candidatesStrings,
    }).computeRounds()
    return [rounds]
  }, [_ballots, candidatesStrings])
  return <VizRoundsBallots rounds={rounds} displayer={DisplayBallots} />
}