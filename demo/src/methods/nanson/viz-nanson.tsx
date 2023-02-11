import React, { useMemo } from 'react'
import {
  selectBallots,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { useStore } from '../../store'
import { StoreBallots } from '../../ballot-with-id'
import { VizRoundsBallots } from '../instant-runoff/viz-rounds'
import { Baldwin, Round } from 'votes/src'
import { BordaTreeMapInner } from '../borda/viz-borda'

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
