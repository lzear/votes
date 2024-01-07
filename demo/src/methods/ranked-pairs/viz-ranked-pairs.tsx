import React, { useRef } from 'react'
import { Tag } from 'antd'
import _ from 'lodash-es'

import { RankedPairs, utils } from 'votes'

import { useStore } from '../../store'
import {
  selectSkewMatrix,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { trafficColor } from '../../traffic-color'
import { ScoresSummary } from '../viz/scores-summary'

type Edge = { from: number; to: number; value: number }

const green = trafficColor(1, 55, 55)
const red = trafficColor(0, 55, 55)
const gray = trafficColor(0, 0, 55)
const color = (ok: boolean | null) => {
  if (ok === null) return 'gray'
  return ok ? green : red
}

const colorClass = (ok: boolean | null) => {
  if (ok === null) return 'default'
  return ok ? 'green' : 'red'
}

export const VizRankedPairs: React.FC = () => {
  const matrix = useStore(selectSkewMatrix)
  const candidatesById = useCandidatesById()
  const candidatesStrings = useCandidatesString()
  // const width = useStore(selectWidth)

  const rp = new RankedPairs(matrix)

  // const [divWidth, setDivWidth] = useState<null | number>(null)
  const ref = useRef<HTMLDivElement>(null)
  // useLayoutEffect(() => {
  //   if (ref.current) setDivWidth(ref.current.offsetWidth)
  // }, [width])

  const allEdges: Edge[] = matrix.array.flatMap(
    (row, from) =>
      row
        .map((value, to) =>
          value > 0 && to !== from ? { from, to, value } : null,
        )
        .filter(Boolean) as Edge[],
  )
  const edgesGroups = _.groupBy(allEdges, 'value')
  const groups = Object.keys(edgesGroups)
    .sort((a, b) => Number(b) - Number(a))
    .map((value) => edgesGroups[value])

  const acyclicGraph = groups.reduce(
    (graph: Edge[], edgesToAdd) =>
      utils.generateAcyclicGraph(graph, edgesToAdd),
    [] as Edge[],
  )

  const groupp = groups.map((g) =>
    g.map((e) => ({
      ...e,
      ok: acyclicGraph.some((ace) => ace.from === e.from && ace.to === e.to),
    })),
  )

  // const ag = acyclicGraph.map((c) => ({
  //   ...c,
  //   from: candidatesStrings[c.from],
  //   to: candidatesStrings[c.to],
  // }))
  return (
    <div className="container" ref={ref}>
      <ScoresSummary scores={rp.scores()} candidatesById={candidatesById} />
      {groupp.map((g) =>
        g.map((e) => (
          <Tag
            key={`${e.from}-${e.to}`}
            color={color(e.ok)}
            style={{ marginBottom: 5 }}
            className={`li ${colorClass(e.ok)}`}
          >
            {e.value}: {candidatesStrings[e.from]}→{candidatesStrings[e.to]}
          </Tag>
        )),
      )}
      {/*{divWidth && candidatesStrings.length > 2 && <ForceGraph />}*/}

      <style jsx>{`
        .li {
          display: inline-block;
          padding: 2px;
        }
        .li.default {
          background: ${gray};
        }
        .li.red {
          background: ${red};
        }
        .li.green {
          background: ${green};
        }
      `}</style>
    </div>
  )
}
