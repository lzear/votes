import React from 'react'

import Ranker from './react-ranker/ranker'
import { WithWidth } from './react-ranker/use-width'
import {
  selectChangeBallotRanking,
  selectSelectBallot,
  selectSelectedBallot,
  selectWidth,
  useCandidates,
} from './store/selectors'
import { useStore } from './store'

export const RankedWithWidth = WithWidth(Ranker)

export const EditBallotRank: React.FC = () => {
  const ballot = useStore(selectSelectedBallot)
  const selectBallot = useStore(selectSelectBallot)
  const candidates = useCandidates()
  const changeBallotRanking = useStore(selectChangeBallotRanking)
  const width = useStore(selectWidth)
  return (
    (ballot && width && (
      <>
        <RankedWithWidth
          key={candidates.length}
          className="container"
          candidates={candidates.map((c) => ({ ...c, name: c.id }))}
          prefs={ballot.ranking}
          onVoteDrop={(a, b) =>
            changeBallotRanking(ballot.id, setPos(ballot.ranking, a.id, b))
          }
          showHovers
        />
        <button onClick={() => selectBallot(null)}>Done</button>
      </>
    )) ||
    null
  )
}

const setPos = (
  oldRanking: string[][],
  elementToMoveId: string,
  newPos: number,
): string[][] => {
  return oldRanking
    .flatMap((oldRank, rid) => {
      let newRank: string[]
      let above = null
      let below = null

      if (newPos < 0 && rid === 0) above = [elementToMoveId]
      else if (newPos > rid && newPos < rid + 1) below = [elementToMoveId]

      if (newPos === rid)
        newRank = oldRank.includes(elementToMoveId)
          ? oldRank
          : [...oldRank, elementToMoveId]
      else newRank = oldRank.filter((c) => c !== elementToMoveId)

      return [above, newRank, below].filter(
        (r) => r && r.length > 0,
      ) as string[][]
    })
    .filter((r) => r.length > 0)
}
