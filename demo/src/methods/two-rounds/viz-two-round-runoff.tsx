import React, { useMemo } from 'react'
import { TwoRoundRunoff } from 'votes'
import { selectBallots, useCandidatesString } from '../../store/selectors'
import { useStore } from '../../store'
import VizRoundsBallots from '../instant-runoff/viz-rounds'
import { DisplayBallots } from '../../display-ballots'

export const VizTwoRoundsRunoff: React.FC = () => {
  const _ballots = useStore(selectBallots)
  const candidatesStrings = useCandidatesString()

  const rounds = useMemo(() => {
    const tr = new TwoRoundRunoff({
      ballots: _ballots,
      candidates: candidatesStrings,
    })
    return tr.computeRounds()
  }, [_ballots, candidatesStrings])

  return <VizRoundsBallots rounds={rounds} displayer={DisplayBallots} />
}
