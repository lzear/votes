import React, { useMemo } from 'react'
import type { Round } from 'votes'

import { Baldwin } from 'votes'

import type { StoreBallots } from '../../ballot-with-id'
import { useStore } from '../../store'
import {
  selectBallots,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { BordaTreeMapInner } from '../borda/viz-borda'
import { VizRoundsBallots } from '../instant-runoff/viz-rounds'

export const Displayer: React.FC<{
  ballots: StoreBallots[]
  containerWidth: number
  candidates: string[]
  round?: Round
}> = ({ ballots, round }) => {
  const candidatesById = useCandidatesById()
  return (
    <div>
      <BordaTreeMapInner
        candidates={round?.candidates.map((c) => candidatesById[c]) || []}
        ballots={ballots}
      />
    </div>
  )
}

export const VizNansonTreemap: React.FC = () => {
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
