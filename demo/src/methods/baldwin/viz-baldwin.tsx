import React, { useMemo } from 'react'
import { selectBallots, useCandidatesString } from '../../store/selectors'
import { useStore } from '../../store'
import { VizRoundsBallots } from '../instant-runoff/viz-rounds'
import { Baldwin } from 'votes/src'
import { Displayer } from '../nanson/viz-nanson'

export const VizBaldinTreemap: React.FC = () => {
  const _ballots = useStore(selectBallots)
  const candidatesStrings = useCandidatesString()

  const [rounds] = useMemo(() => {
    const rounds = new Baldwin({
      ballots: _ballots,
      candidates: candidatesStrings,
    }).computeRounds()
    return [rounds]
  }, [_ballots, candidatesStrings])

  return <VizRoundsBallots rounds={rounds} displayer={Displayer} />
}
