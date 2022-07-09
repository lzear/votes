import {
  forceCenter,
  forceManyBody,
  forceSimulation,
  type Simulation,
} from 'd3-force'
import React, { useEffect, useRef, useState } from 'react'
import { dispatch } from 'd3-dispatch'
import { interval } from 'd3-timer'
import { forceLink } from './force-link'
import { a, useSprings } from '@react-spring/web'
import { curvedPath } from './curved-path'
import { randomString } from './random-string'
import { useStore } from './store'
import { selectSkewMatrix } from './store/selectors'

const width = 600
const height = 600

const centerX = width * 0.5
const centerY = height * 0.5

type Node = {
  index: number
  id: string | number
  x: number
  y: number
  vx: number
  vy: number
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
  const matrix = useStore(selectSkewMatrix)
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

  const [springs, api] = useSprings(matrix.candidates.length, () => ({
    x: centerX,
    y: centerY,
    config: {
      // friction: 400,
    },
  }))

  const [lineSprings, linesApi] = useSprings(links.length, () => ({
    d: `M${0},${0}Q${0},${0},${0},${0}` as string,
    x1: centerX,
    y1: centerY,
    x2: centerX,
    y2: centerY,
  }))
  const nodePos = useRef<Node[]>()
  useEffect(() => {
    const nodes: Node[] = matrix.candidates.map((c, index) => ({
      index,
      id: matrix.candidates[index],
      x: 0,
      vx: 0,
      y: 0,
      vy: 0,
    }))
    const sim: Simulation<Node, Link> = forceSimulation(nodes)
      .tick(20)
      .force('charge', forceManyBody().distanceMin(2).strength(-100))
      .force(
        'link',
        forceLink(links)
          .distance(140)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .id((d: Node) => d.id),
      )
      .force('center', forceCenter(centerX, centerY))
      .stop()

    const event = dispatch('tick', 'end')
    const stepper = interval(step, 100)
    function step() {
      tick()
      event.call('tick', sim)
      if (sim.alpha() < sim.alphaMin()) {
        stepper.stop()
        event.call('end', sim)
      }
    }

    const tickHandler = () => {
      const nodes = sim.nodes()
      nodePos.current = nodes
      if (!nodes) return
      api.start((index) => {
        const node = nodes[index]
        if (!node) return
        const { x, y } = node
        return { x, y, immediate: true }
      })

      linesApi.start((index) => {
        const link = links[index]
        if (!link) return

        const { sourceIdx, targetIdx } = link
        const nodes = sim.nodes()
        if (!nodes) return
        const { x: x1, y: y1 } = nodes[sourceIdx]
        const { x: x2, y: y2 } = nodes[targetIdx]
        const d = curvedPath(
          {
            source: { x: x1, y: y1 },
            target: { x: x2, y: y2 },
            weight: 2,
          },
          [20, 30],
          0.05,
        )
        return { x1, y1, x2, y2, d, immediate: true }
      })
    }
    const tick = () => {
      sim.tick()
      tickHandler()
    }
    // sim.on('tick', () => {
    //   tickHandler()
    // })

    return () => {
      sim.stop()
      stepper.stop()
    }
  }, [api, divId, linesApi, links, matrix.array, matrix.candidates])
  return (
    <div className="container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {springs.map(({ x, y }, idx) => (
          <a.text
            key={matrix.candidates[idx]}
            x={x}
            y={y}
            alignmentBaseline="middle"
            textAnchor="middle"
            pointerEvents="none"
            transform-box="fill-box"
            transform-origin="center"
          >
            {matrix.candidates[idx]}
          </a.text>
        ))}
        {lineSprings.map(({ d }, idx) => (
          <a.path
            key={links[idx].id}
            stroke="#666666"
            strokeWidth="1.8"
            markerEnd="url(#arrowhead-default)"
            d={d}
            fill="none"
          />
        ))}
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
