import {
  forceManyBody,
  forceSimulation,
  Simulation,
  SimulationNodeDatum,
} from 'd3-force'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { select } from 'd3-selection'
import { randomString } from './random-string'
import { useStore } from './store'
import { selectMatrix } from './store/selectors'

const width = 600
const height = 600

const centerX = width * 0.5
const centerY = height * 0.5

export interface Node extends SimulationNodeDatum {
  name: string
  id: string
}

type Link = {
  id: string
  sourceIdx: number
  targetIdx: number
  source: Node | string | number
  target: Node | string | number
  weight: number
}

export const ForceGraph: React.FC = () => {
  const matrix = useStore(selectMatrix)
  const [divId] = useState(randomString())
  const links = matrix.array
    .flatMap(
      (row, rowIdx) =>
        row
          .map((weight, colIdx) => {
            if (weight <= 0) return null
            const link: Link = {
              sourceIdx: rowIdx,
              targetIdx: colIdx,
              source: matrix.candidates[rowIdx],
              target: matrix.candidates[colIdx],
              weight,
              id: `${rowIdx} ${colIdx}`,
            }
            return link
          })
          .filter(Boolean) as Link[],
    )
    .map((v, index) => ({ index, ...v }))

  const nodesData = useMemo(
    () => matrix.candidates.map((name) => ({ name, id: name } as Node)),
    [matrix.candidates],
  )

  const cRef = useRef(
    matrix.candidates.map((id) => {
      const r: SimulationNodeDatum & { id: string } = { id }
      return r
    }),
  )
  useLayoutEffect(() => {
    const svg = select<SVGSVGElement, never>(`#${divId}`)
    // const nodesG = svg.select('g.nodes')
    // console.log('%c nodesG', 'background: #222; color: #bada55', nodesG)
    // const nodes = nodesG.selectAll('g').data(nodesData) // .enter().append('g')
    // console.log('%c nodes', 'background: #222; color: #bada55', nodes)

    const sim: Simulation<SimulationNodeDatum & { id: string }, Link> =
      forceSimulation(cRef.current)
        .tick(20)
        .force('charge', forceManyBody().distanceMin(2).strength(-100))
    //   .force(
    //     'link',
    //     forceLink(links)
    //       .distance(140)
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       .id((d: Node) => d.id),
    //   )
    //   .force('center', forceCenter(centerX, centerY))
    //   .stop()

    // sim.on('tick', () => {
    //   tickHandler()
    // })

    return () => {
      // sim.stop()
    }
  }, [divId, links, matrix.array, matrix.candidates, nodesData])
  return (
    <div className="container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="nodes">
          {matrix.candidates.map((candidate, idx) => (
            <text
              key={candidate}
              alignmentBaseline="middle"
              textAnchor="middle"
              pointerEvents="none"
              transform-box="fill-box"
              transform-origin="center"
            >
              {matrix.candidates[idx]}
            </text>
          ))}
        </g>
        {/*{lineSprings.map(({ d }, idx) => (*/}
        {/*  <a.path*/}
        {/*    key={links[idx].id}*/}
        {/*    stroke="#666666"*/}
        {/*    strokeWidth="1.8"*/}
        {/*    markerEnd="url(#arrowhead-default)"*/}
        {/*    d={d}*/}
        {/*    fill="none"*/}
        {/*  />*/}
        {/*))}*/}
        <defs>
          <marker
            id="arrowhead-default"
            viewBox="-0 -5 10 10"
            refX="0"
            refY="0"
            orient="auto"
            markerWidth="11"
            markerHeight="11"
            markerUnits="userSpaceOnUse"
          >
            <path
              d="M 0,-5 L 10 ,0 L 0,5"
              fill="#999"
              style={{ stroke: 'none' }}
            />
          </marker>
        </defs>
      </svg>
      <style jsx>{`
        .container {
          display: flex;
        }
        svg {
          width: ${width}px;
          height: ${height}px;
        }
      `}</style>
    </div>
  )
}
