import _ from 'lodash'
import React from 'react'
import { StoreBallots } from './ballot-with-id'
import { numberToLetters } from './list-votes-group'

export const AxisBallot: React.FC<{
  range: [number, number]
  offsetY: number
  scale: { [id: string]: { offset: number; width: number } }
  ballots: StoreBallots[]
}> = ({ scale, range, offsetY = 20, ballots }) => {
  return (
    <>
      <path
        d={['M', range[0], offsetY - 6, 'v', 6, 'H', range[1], 'v', -6].join(
          ' ',
        )}
        fill="none"
        stroke="currentColor"
      />
      {ballots.map((b) => {
        const item = scale[b.id]
        return (
          <g
            key={b.id}
            transform={`translate(${item.offset + item.width / 2}, ${offsetY})`}
            style={{
              transition: 'all 400ms',
            }}
          >
            <line y2="-6" stroke="currentColor" />
            <text
              style={{
                fontSize: '10px',
                textAnchor: 'middle',
                transform: 'translateY(-10px)',
              }}
            >
              {numberToLetters(b.idx)}
            </text>
          </g>
        )
      })}
    </>
  )
}
export const AxisRank: React.FC<{
  range: [number, number]
  offsetX: number
  scale: { [id: string]: { offset: number; width: number } }
}> = ({ scale, range, offsetX = 20 }) => {
  const size = Object.keys(scale).length
  return (
    <>
      <path
        d={['M', offsetX - 6, range[0], 'h', 6, 'V', range[1], 'h', -6].join(
          ' ',
        )}
        fill="none"
        stroke="currentColor"
      />
      {Object.keys(scale).map((b, idx) => {
        const item = scale[b]
        return (
          <g
            key={b}
            transform={`translate(${offsetX}, ${
              range[0] + item.offset //+ item.width / 2
            })`}
            style={{
              transition: 'all 400ms',
            }}
          >
            <line x2="-6" stroke="currentColor" />
            <text
              style={{
                fontSize: '10px',
                textAnchor: 'end',
                transition: 'all 400ms',
                dominantBaseline: 'middle',
                transform: `translate(-3px, ${item.width / 2}px)`,
              }}
            >
              {size - idx} pts
            </text>
          </g>
        )
      })}
    </>
  )
}
const e10 = Math.sqrt(50),
  e5 = Math.sqrt(10),
  e2 = Math.sqrt(2)
function tickIncrement(start: number, stop: number, count: number): number {
  const step = (stop - start) / Math.max(0, count),
    power = Math.floor(Math.log10(step)),
    error = step / Math.pow(10, power)
  return power >= 0
    ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) *
        Math.pow(10, power)
    : -Math.pow(10, -power) /
        (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1)
}
export const AxisRank2: React.FC<{
  range: [number, number]
  offsetX: number
  max: number
}> = ({ max, range, offsetX }) => {
  const incr = tickIncrement(0, max, 5)
  const ticks = _.range(0, max, incr)
  return (
    <>
      <path
        d={['M', offsetX - 6, range[0], 'h', 6, 'V', range[1], 'h', -6].join(
          ' ',
        )}
        fill="none"
        stroke="currentColor"
      />
      {ticks.map((t, idx) => {
        return (
          <g
            key={t}
            transform={`translate(${offsetX}, ${
              range[0] + ((range[1] - range[0]) * t) / max
            })`}
            style={{
              transition: 'all 400ms',
            }}
          >
            <line x2="-6" stroke="currentColor" />
            <text
              style={{
                fontSize: '10px',
                textAnchor: 'end',
                transition: 'all 400ms',
                dominantBaseline: 'middle',
                transform: `translate(-10px, 0px)`,
              }}
            >
              {idx * incr}
            </text>
          </g>
        )
      })}
    </>
  )
}

export const AxisCandidatesBot: React.FC<{
  range: [number, number]
  offsetY: number
  candidates: string[]
  scale: { [id: string]: { offset: number; width: number } }
}> = ({ candidates, scale, range, offsetY = 20 }) => {
  return (
    <>
      <path
        d={['M', range[0], offsetY + 6, 'v', -6, 'H', range[1], 'v', 6].join(
          ' ',
        )}
        fill="none"
        stroke="currentColor"
      />
      {candidates.map((c) => {
        const item = scale[c]
        return (
          <g
            key={c}
            transform={`translate(${item.offset + item.width / 2}, ${offsetY})`}
            style={{
              transition: 'all 400ms',
            }}
          >
            <line y2="4" stroke="currentColor" />
            <text
              style={{
                fontSize: '10px',
                textAnchor: 'middle',
                transform: 'translateY(17px) rotate(-21deg)',
              }}
            >
              {c}
            </text>
          </g>
        )
      })}
    </>
  )
}
