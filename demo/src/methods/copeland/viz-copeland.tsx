import React, { useRef } from 'react'
import { useStore } from '../../store'
import { selectMatrix, useCandidatesById } from '../../store/selectors'
import { ScoresSummary } from '../viz/scores-summary'
import { Copeland } from 'votes'

export const VizCopeland: React.FC = () => {
  const matrix = useStore(selectMatrix)
  const candidatesById = useCandidatesById()
  // const candidatesStrings = useCandidatesString()
  // const width = useStore(selectWidth)

  const cope = new Copeland(matrix)

  // const [divWidth, setDivWidth] = useState<null | number>(null)
  const ref = useRef<HTMLDivElement>(null)
  // useLayoutEffect(() => {
  //   if (ref.current) setDivWidth(ref.current.offsetWidth)
  // }, [width])
  return (
    <div className="container" ref={ref}>
      <ScoresSummary scores={cope.scores()} candidatesById={candidatesById} />
      {/*{divWidth && candidatesStrings.length > 2 && <ForceGraph />}*/}
    </div>
  )
}
