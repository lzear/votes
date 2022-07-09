import React, {
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDrag } from '@use-gesture/react'
import { animated, to, useSprings } from 'react-spring'
import _ from 'lodash'
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import BucketBoxes from './bucket-boxes'
import {
  B_GUTTER,
  B_HEIGHT,
  L_PADDING,
  OPTION_GUTTER,
  OPTION_HEIGHT,
} from './constants'
import type { ReactDOMAttributes } from '@use-gesture/react/dist/declarations/src/types'

type Candidate = { id: string; name: string; color: string }

export interface Props extends HTMLAttributes<HTMLDivElement> {
  prefs: string[][]
  onVoteDrop(element: Candidate, newRank: number): void
  showHovers?: boolean
  width: number
  candidates: Candidate[]
}

// const L_PADDING = 40
// const B_HEIGHT = 45
// const OPTION_HEIGHT = 40
// const B_GUTTER = 10
// const JIGGLE = 6
// const GUTTER = -10

const prefs2rankDict = (prefs: string[][]) =>
  prefs.reduce(
    (acc, idxs, rank) => ({
      ...acc,
      ...idxs.reduce(
        (ac, id) => ({ ...ac, [id]: rank }),
        {} as { [idx: string]: number },
      ),
    }),
    {} as { [idx: string]: number },
  )

const allRanks = (prefs: string[][], candidates: { id: string }[]) =>
  [
    ...prefs,
    _.difference(
      candidates.map((c) => c.id),
      prefs.flat(),
    ),
  ].filter((r) => r.length)

const Ranker: React.FC<Props> = ({
  onVoteDrop,
  prefs,
  showHovers,
  candidates,
  width: totalWidth,
  ...props
}) => {
  const ROW_WIDTH = totalWidth - L_PADDING
  const ROW_WIDTH_EXTRA = ROW_WIDTH + OPTION_GUTTER
  const ar = useMemo(() => allRanks(prefs, candidates), [candidates, prefs])
  const rankDict = prefs2rankDict(ar)
  const fn = useCallback(
    (y: number, x: number, nE: number) => ({
      x: x * (ROW_WIDTH_EXTRA / nE) + OPTION_GUTTER / 2,
      y:
        (y * 2 + 1) * (B_HEIGHT + B_GUTTER) +
        // 2 +
        (x % 2) * (B_HEIGHT - OPTION_HEIGHT),
      width: ROW_WIDTH_EXTRA / nE - OPTION_GUTTER,
      scale: 1,
      zIndex: 1 + x,
      shadow: 1,
      immediate: (n: string) => n === 'zIndex',
    }),
    [ROW_WIDTH_EXTRA],
  )
  const [nextB, setNextB] = useState<number | null>(null)
  const prefRef = useRef(rankDict)
  const [springs, setSprings] = useSprings(
    candidates.length,
    (idx) => {
      const cid = candidates[idx].id
      const y = rankDict[cid]
      const x = ar[y].indexOf(cid)
      const nE = ar[y].length
      return fn(y, x, nE)
    },
    [],
  )

  useEffect(() => {
    prefRef.current = rankDict
    setSprings.start((index: number) => {
      const cid = candidates[index].id
      const y = rankDict[cid]
      const x = ar[y].indexOf(cid)
      const nE = ar[y].length
      return fn(y, x, nE)
    })
  }, [candidates, prefs, fn, setSprings, rankDict, ar])

  type Args = [
    i: number,
    onDropi: (element: Candidate, newRank: number) => void,
    size: number,
  ]
  const bind: (...args: Args) => ReactDOMAttributes = useDrag(
    ({ args, down, movement: [, y] }) => {
      const [originalIndex, onDropi, size] = args as Args
      const candidate: Candidate | undefined = candidates[originalIndex]
      const prevRank = candidate ? prefRef.current[candidate.id] : 0
      setSprings.start((index: number) => {
        if (down && index === originalIndex)
          return {
            x: 0,
            y: (prevRank * 2 + 1) * (B_HEIGHT + B_GUTTER) + y,
            width: ROW_WIDTH,
            scale: 1.1,
            zIndex: 100,
            shadow: 15,
            immediate: (n: string) => n === 'y' || n === 'zIndex',
          }
        return {}
      })
      if (showHovers || !down) {
        const YYY = (prevRank * 2 + 1) * (B_HEIGHT + B_GUTTER) + y
        const nextIdx =
          _.clamp(
            Math.round(YYY / (B_HEIGHT + B_GUTTER) - 1),
            -1,
            size * 2 + 1,
          ) / 2
        if (!down) {
          setNextB(null)
          onDropi(candidate, nextIdx)
        } else if (showHovers && nextIdx !== nextB) {
          setNextB(nextIdx)
        }
      }
    },
  )

  const move = (candidateIdx: number, upDown: number) => {
    const candidate = candidates[candidateIdx]
    const rank = rankDict[candidate.id]
    const isAlone = Object.values(rankDict).filter((r) => r === rank).length < 2
    const dif = isAlone ? upDown : upDown / 2
    onVoteDrop(candidate, rank + dif)
  }
  const maxRank: number = ar.length

  const aloneFirst = prefs[0]?.length === 1 ? prefs[0][0] : null
  const aloneLast =
    prefs[prefs.length - 1]?.length === 1 &&
    prefs.flat().length === candidates.length
      ? prefs[prefs.length - 1][0]
      : null
  return (
    <div
      style={{
        ...props.style,
        height: (2 * maxRank + 1) * (B_HEIGHT + B_GUTTER),
        position: 'relative',
        transition: 'height 0.5s',
      }}
    >
      <div
        style={{
          position: 'relative',
          marginLeft: `${L_PADDING - OPTION_GUTTER / 2}px`,
        }}
      >
        {springs.map(({ zIndex, shadow, y, scale, width, x }, i) => (
          <animated.div
            // eslint-disable-next-line react/no-array-index-key
            // key={candidates[i].id}
            key={i}
            {...bind(i, onVoteDrop, maxRank)}
            className="candidateglob"
            tabIndex={0}
            style={{
              zIndex,
              width,
              boxShadow: shadow.to(
                (s) => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`,
              ),
              transform: to(
                [x, y, scale],
                (xx, yy, s) => `translate3d(${xx}px,${yy}px,0) scale(${s})`,
              ),
              backgroundColor: candidates[i].color,
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') move(i, -1)
              else if (e.key === 'ArrowDown') move(i, 1)
              else return
              e.preventDefault()
            }}
          >
            <div className="car">
              <CaretUpOutlined
                onMouseDown={(e) => {
                  move(i, -1)
                  e.preventDefault()
                  e.stopPropagation()
                }}
                style={{
                  cursor: 'pointer',
                  visibility:
                    aloneFirst === candidates[i].id ? 'hidden' : undefined,
                }}
              />
              <CaretDownOutlined
                onMouseDown={(e) => {
                  move(i, 1)
                  e.preventDefault()
                  e.stopPropagation()
                }}
                style={{
                  cursor: 'pointer',
                  visibility:
                    aloneLast === candidates[i].id ? 'hidden' : undefined,
                }}
              />
            </div>
            {candidates[i].name}
          </animated.div>
        ))}
      </div>
      <BucketBoxes
        bHeight={B_HEIGHT}
        bGutter={B_GUTTER}
        count={maxRank}
        hovered={nextB !== null ? nextB * 2 + 1 : null}
      />
      <style jsx global>{`
        .car {
          flex-direction: column;
          margin-right: 8px;
        }
        .car > span:hover {
          outline: solid 1px white;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .candidateglob {
          display: flex;
          align-items: center;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          touch-action: none;
          position: absolute;
          height: ${OPTION_HEIGHT}px;
          pointer-events: auto;
          transform-origin: 50% 50% 0;
          border-radius: 5px;
          color: #fff;
          line-height: 30px;
          padding-left: 8px;
          text-transform: uppercase;
          letter-spacing: -0.0142857em;
          cursor: -webkit-grab;
          user-select: none;
        }
      `}</style>
    </div>
  )
}

export default Ranker
