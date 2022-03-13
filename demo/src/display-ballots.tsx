import React, { useMemo } from 'react'
import type { Ballot, Round } from 'votes'
import { useCandidatesColors } from './store/selectors'
import { StoreBallots } from './ballot-with-id'
import {
  BoxBase,
  BoxPosition,
  toBoxes,
  withBallotX,
  withColor,
  WithColor,
  withQualified,
} from './ballots-ui'
import { renderBoxes, useBoxesTransition } from './boxes-transition'
import { SvgBallots } from './svg-ballots'
import { AxisBallot } from './axis'
import { scaling } from './scale'

const getHighestBallot = (ballots: Ballot[]) =>
  Math.max(...ballots.map((b) => b.ranking.length))

const maxHeight = 400
const marginTop = 20

export const DisplayBallots: React.FC<{
  ballots: StoreBallots[]
  containerWidth: number
  candidates: string[]
  round: Round
}> = ({ ballots, containerWidth, round }) => {
  const colors = useCandidatesColors()

  const heighest = useMemo(() => getHighestBallot(ballots), [ballots])

  const cellHeight = Math.min(maxHeight / heighest, 40)
  const mainHeight = cellHeight * heighest
  const svgHeight = mainHeight + marginTop
  // const scaleBallotsY = useMemo(() => {
  //   return scaling({
  //     array: _.range(candidates.length),
  //     paddingInner: 0,
  //     domain: [marginTop, svgHeight],
  //   })
  // }, [candidates.length, svgHeight])
  const scaleBallotsX = useMemo(
    () =>
      scaling({
        array: ballots,
        paddingInner: 0.1,
        domain: [0, containerWidth],
      }),
    [ballots, containerWidth],
  )

  const boxes: (BoxBase & BoxPosition & WithColor)[] = useMemo(() => {
    const _bboxes = withBallotX(
      withColor(toBoxes(ballots), colors),
      scaleBallotsX,
    )
    if (!round)
      return _bboxes.map((b) => ({
        ...b,
        y: cellHeight * b.rankIdx + marginTop,
        height: cellHeight,
        contrast: b.rankIdx === 0,
      }))
    const bboxes = withQualified(_bboxes, round)
    const final = round.roundResult.qualified.length === 0
    return bboxes.map((b) => ({
      ...b,
      y: cellHeight * b.rankIdx + marginTop,
      height: cellHeight,
      opacity: !round || final || b.qualified ? 1 : 0.5,
      filter:
        final || b.qualified
          ? undefined
          : 'contrast(0.8) brightness(0.8) saturate(0.8) opacity(0.8)',
      contrast: b.rankIdx === 0,
    }))
  }, [ballots, cellHeight, colors, round, scaleBallotsX])

  const transitions = useBoxesTransition(boxes)

  return (
    <div className="container">
      <SvgBallots
        key="eee"
        containerWidth={containerWidth}
        // height={svgHeight}
        height={svgHeight}
        overflowSides={50}
        // overflowBottom={15}
        // overflowTop={15}
      >
        {renderBoxes(transitions)}
        <AxisBallot
          range={[0, containerWidth]}
          offsetY={20}
          scale={scaleBallotsX}
          ballots={ballots}
        />
        {/*<rect*/}
        {/*  y={marginTop}*/}
        {/*  style={{*/}
        {/*    width: containerWidth,*/}
        {/*    height: cellHeight,*/}
        {/*  }}*/}
        {/*  fill="transparent"*/}
        {/*  stroke="#444"*/}
        {/*  strokeWidth={5}*/}
        {/*/>*/}
      </SvgBallots>
      <style jsx>{`
        .container {
          // transition: height 2s;
          // overflow: hidden;

          border: 1px solid #000;
          border-radius: 3px;
          width: 100%;
          // overflow: hidden;
        }
      `}</style>
      <style jsx>{`
        .container {
          width: ${containerWidth}px;
          // height: 400px;
        }
      `}</style>
    </div>
  )
}
