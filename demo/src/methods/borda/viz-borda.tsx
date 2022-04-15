import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { a, to, useSpring } from '@react-spring/web'
import { useHover } from '@use-gesture/react'
import _ from 'lodash'
import { Button } from 'antd'
import * as d3 from 'd3'
import { hierarchy, treemap } from 'd3-hierarchy'
import { scaleBand } from 'd3-scale'
import shallow from 'zustand/shallow'
import {
  selectBallots,
  selectWidth,
  useCandidatesById,
  useCandidatesColors,
  useCandidatesString,
} from '../../store/selectors'
import { numberToLetters } from '../../list-votes-group'
import { AxisBallot, AxisCandidatesBot, AxisRank, AxisRank2 } from '../../axis'
import {
  BoxBase,
  BoxMeta,
  BoxPosition,
  idToBidNCandidate,
  toBoxes,
  withColor,
  WithColor,
} from '../../ballots-ui'
import { SvgBallots } from '../../svg-ballots'
import { renderBoxes, useBoxesTransition } from '../../boxes-transition'
import { scaling } from '../../scale'
import { useStore } from '../../store'
import { Candidate } from '../../generate-ballots'
import { BallotWithId, StoreBallots } from '../../ballot-with-id'
import { Borda } from 'votes'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'

export const withPrefAbove2 = <B extends BoxMeta>(
  boxes: B[],
  ballots: BallotWithId[],
  candidatesCount: number,
) => {
  const ballotsById = _.keyBy(ballots, 'id')
  return boxes.map((b) => {
    const rankedAbove = ballotsById[b.ballotId].ranking
      .slice(0, b.rankIdx)
      .flat().length

    // const totalPts = partialSum(candidatesCount)
    const bordaPoints =
      (partialSum(candidatesCount - rankedAbove) -
        partialSum(candidatesCount - rankedAbove - b.rankSize)) /
      b.rankSize

    return { ...b, rankedAbove, bordaPoints }
  })
}

enum Step {
  INIT,
  // STRETCH,
  BORDA_POINT,
  TREEMAP,
}

const steps = [Step.INIT, Step.BORDA_POINT, Step.TREEMAP]

const BUTTONS = {
  [Step.INIT]: 'Reset',
  [Step.BORDA_POINT]: 'Scale area with Borda points',
  [Step.TREEMAP]: 'Group by candidate',
}

const boxInit = ({
  scale,
  b,
  cellHeight,
}: {
  scale: { [ballotId: string]: { offset: number; width: number } }
  b: BoxMeta & { rankedAbove: number }
  cellHeight: number
}) => ({
  x: scale[b.ballotId].offset + (b.cIdx * scale[b.ballotId].width) / b.rankSize,
  width: scale[b.ballotId].width / b.rankSize,
  y: cellHeight * b.rankIdx,
  height: cellHeight,
})

export const partialSum = (n: number): number => (n * (n + 1)) / 2

const boxBordaPoints = ({
  scale,
  b,
  cellHeight,
  candidatesCount,
}: {
  scale: {
    [ballotId: string]: { offset: number; width: number }
  }
  b: BoxMeta & { rankedAbove: number; bordaPoints: number }
  cellHeight: number
  candidatesCount: number
}) => {
  const totalPts = partialSum(candidatesCount)
  return {
    x:
      scale[b.ballotId].offset +
      (b.cIdx * scale[b.ballotId].width) / b.rankSize,
    width: scale[b.ballotId].width / b.rankSize,
    height: (cellHeight * b.bordaPoints * b.rankSize) / totalPts,
    y:
      (cellHeight *
        (partialSum(candidatesCount) -
          partialSum(candidatesCount - b.rankedAbove))) /
      totalPts,
  }
}

export const getCandidatesScale = (
  candidates: string[],
  width: number,
): d3.ScaleBand<string> =>
  scaleBand().domain(candidates).range([0, width]).paddingInner(0.1)

const boxTreemap = <
  B extends BoxBase & {
    rankedAbove: number
    bordaPoints: number
    weight: number
  },
>({
  boxes,
  candidates,
  containerWidth,
  svgHeight,
}: {
  boxes: B[]
  containerWidth: number
  svgHeight: number
  candidates: string[]
}) => {
  const scaleC = getCandidatesScale([...candidates], containerWidth)

  const groups = _.groupBy(boxes, 'candidate')
  const values = _.mapValues(groups, (group) =>
    group.reduce((acc, item) => acc + item.bordaPoints * item.weight, 0),
  )
  const maxValue = Math.max(...Object.values(values))

  const treesLeaves = _.mapValues(groups, (group, candidate) =>
    treemap<BoxMeta>()
      // .tile(treemapBinary)
      .paddingInner(0.5)
      .size([scaleC.bandwidth(), (svgHeight * values[candidate]) / maxValue])(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        hierarchy({ children: group }).sum(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (d) => d.bordaPoints * d.weight || 0,
        ),
      )
      .leaves(),
  )
  const flatTrees = Object.values(treesLeaves).flat()
  const leafById = _.keyBy(flatTrees, (value) => elId(value))

  return boxes.map((d) => {
    return {
      ...d,
      x: (scaleC(d.candidate) || 0) + leafById[d.id].x0,
      y: leafById[d.id].y0 + svgHeight * (1 - values[d.candidate] / maxValue),
      width: leafById[d.id].x1 - leafById[d.id].x0,
      height: leafById[d.id].y1 - leafById[d.id].y0,
      display: `${numberToLetters(d.ballotIdx)}:  ${d.weight * d.bordaPoints}`,
    }
  })

  /*

            .attr('x', (d) => (scale(d.candidate) || 0) + leafById[d.id].x0)
            .attr('y', (d) => leafById[d.id].y0)
            .attr('width', (d) => leafById[d.id].x1 - leafById[d.id].x0)
            .attr('height', (d) => leafById[d.id].y1 - leafById[d.id].y0);
   */
}

export const elId = (
  d: d3.HierarchyRectangularNode<BoxMeta> | BoxMeta,
): string => {
  if ('data' in d) {
    const b = d.data
    return b.id
  }
  return d.id
}

const MARGIN_TOP = 20

export const BordaTreeMap: React.FC = () => {
  const ballots = useStore(selectBallots, shallow)

  const candidatesString = useCandidatesString()
  const candidatesById = useCandidatesById()
  const candidates = candidatesString.map((c) => candidatesById[c])

  return <BordaTreeMapInner ballots={ballots} candidates={candidates} />
}

export const BordaTreeMapInner: React.FC<{
  ballots: StoreBallots[]
  candidates: Candidate[]
}> = ({ ballots, candidates }) => {
  const [step, setStep] = useState(Step.INIT)

  const candidatesString = candidates.map((c) => c.id)

  const colors = useCandidatesColors()
  const width = useStore(selectWidth, shallow)
  const bordiScores2 = new Borda({
    ballots,
    candidates: candidatesString,
  }).scores()
  const maxScore = Math.max(...Object.values(bordiScores2))
  const [_divWidth, setDivWidth] = useState<null | number>(null)
  const RANKWIDTH = step === Step.TREEMAP ? 30 : 30
  // const RANKWIDTH = 50
  const divWidth = _divWidth && _divWidth - RANKWIDTH
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (ref.current) setDivWidth(ref.current.offsetWidth)
  }, [width])

  const svgHeight = 400
  const mainHeight = svgHeight - MARGIN_TOP
  const cellHeight = mainHeight / candidates.length

  const scale =
    divWidth &&
    scaling({
      array: ballots,
      paddingInner: 0.1,
      domain: [0, divWidth],
    })

  const ranks = _.range(candidatesString.length)
  const scaleRank = scaling({
    array: ranks.map((r, idx) => ({
      weight: step === Step.BORDA_POINT ? candidatesString.length - idx : 1,
      id: idx.toString(),
    })),
    paddingInner: 0,
    domain: [0, mainHeight],
  })
  const scaleCandidates =
    divWidth &&
    scaling({
      array: candidatesString.map((c) => ({ weight: 1, id: c })),
      paddingInner: 0.1,
      domain: [0, divWidth],
    })

  const bboxes = useMemo(
    () =>
      withPrefAbove2(
        withColor(toBoxes(ballots), colors),
        ballots,
        candidates.length,
      ),
    [ballots, candidates.length, colors],
  )
  const boxes: (BoxMeta & BoxPosition & WithColor)[] = useMemo(() => {
    if (!scale) return []
    if (step === Step.TREEMAP) {
      return boxTreemap({
        boxes: bboxes,
        svgHeight: mainHeight,
        candidates: candidatesString,
        containerWidth: divWidth,
      })
    }
    return bboxes.map((b) => {
      let coords = {}
      if (step === Step.INIT) coords = boxInit({ scale, b, cellHeight })
      // if (step === Step.STRETCH) coords = boxStretch({ scale, b, cellHeight })
      if (step === Step.BORDA_POINT)
        coords = boxBordaPoints({
          scale,
          b,
          cellHeight: cellHeight * candidates.length,
          candidatesCount: candidates.length,
        })
      return {
        ...b,

        x:
          scale[b.ballotId].offset +
          (b.cIdx * scale[b.ballotId].width) / b.rankSize,
        width: scale[b.ballotId].width / b.rankSize,
        height: cellHeight * b.rankSize,
        y: cellHeight * b.rankedAbove,

        ...coords,
      }
    })
  }, [
    bboxes,
    candidates.length,
    candidatesString,
    cellHeight,
    divWidth,
    mainHeight,
    scale,
    step,
  ])

  const transitions = useBoxesTransition(boxes)

  const [{ top, left, opacity, ...box }, api] = useSpring(
    () => ({
      top: 0,
      left: 0,
      product: 0,
      bordaPoints: 0,
      backgroundColor: '#fff',
      candidateIdx: -1,
      ballotIdx: -1,
      candidate: '',
      weight: 0,
      opacity: 0,
    }),
    [],
  )

  const g = useHover(
    (a) => {
      const target = a.currentTarget as SVGElement
      const { ballotId } = idToBidNCandidate(target.id)
      const ballot = ballots.find((b) => b.id === ballotId)
      const box = bboxes.find((b) => b.id === target.id)
      const bb = target.getBoundingClientRect()
      if (!a.hovering) api.start({ opacity: 0 })
      else if (ref.current && ballot && box) {
        const boundingRect = ref.current?.getBoundingClientRect()
        if (boundingRect) {
          api.start({
            ballotIdx: box.ballotIdx,
            top: bb.top - boundingRect.top,
            left: bb.left + bb.width / 2 - boundingRect.left,
            product: box.bordaPoints * box.weight,
            bordaPoints: box.bordaPoints,
            candidateIdx: candidatesString.indexOf(box.candidate),
            weight: box.weight,
            opacity: 0.94,
            backgroundColor: colors[box.candidate] || '#000',
            immediate: ['candidateIdx', 'ballotIdx'],
          })
        }
      }
    },
    { hover: { enabled: true } },
  )
  return (
    <>
      <div className="svgContainer" ref={ref}>
        <a.div
          className="ant-tooltip ant-tooltip-placement-top"
          style={{
            top,
            left,
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            opacity,
            pointerEvents: 'none',
            // backgroundColor: box.backgroundColor,
          }}
        >
          <div className="ant-tooltip-content">
            <div className="ant-tooltip-arrow">
              <a.span
                className="ant-tooltip-arrow-content"
                style={{
                  backgroundColor: box.backgroundColor,
                }}
              />
            </div>
            <a.div
              className="ant-tooltip-inner"
              role="tooltip"
              style={{
                backgroundColor: box.backgroundColor,
              }}
            >
              <span>
                <a.strong>
                  {to(
                    [box.bordaPoints, box.weight],
                    (bordaPoints, weight) =>
                      `+${(bordaPoints * weight).toFixed(2)}`,
                  )}
                </a.strong>{' '}
                points for{' '}
                <a.strong>
                  {box.candidateIdx.to((v) => candidatesString[Math.ceil(v)])}
                </a.strong>{' '}
                from{' '}
                <a.strong>
                  {box.ballotIdx.to((n) => numberToLetters(Math.floor(n)))}
                </a.strong>
              </span>
              <br />
              <span>
                (<a.strong>{box.bordaPoints.to((n) => n.toFixed(2))}</a.strong>{' '}
                points *{' '}
                <a.strong>{box.weight.to((n) => n.toFixed(2))}</a.strong>{' '}
                voters)
              </span>
            </a.div>
          </div>
        </a.div>
        {scaleCandidates && divWidth && scale && (
          <SvgBallots
            height={svgHeight}
            containerWidth={_divWidth}
            overflowSides={20}
            overflowBottom={20}
          >
            <g
              style={{
                transform: `translate(${RANKWIDTH}px, 0px)`,
                transition: 'transform 200ms',
              }}
            >
              <g
                style={{
                  transform: `translate(0px, ${
                    step === Step.TREEMAP ? 0 : MARGIN_TOP
                  }px)`,
                  transition: 'transform 200ms',
                }}
              >
                {renderBoxes(transitions, g)}
              </g>

              {step === Step.TREEMAP ? (
                <AxisCandidatesBot
                  range={[0, divWidth]}
                  offsetY={mainHeight}
                  candidates={candidatesString}
                  scale={scaleCandidates}
                />
              ) : (
                <AxisBallot
                  range={[0, divWidth]}
                  offsetY={MARGIN_TOP}
                  scale={scale}
                  ballots={ballots}
                />
              )}
            </g>
            {step === Step.TREEMAP ? (
              <AxisRank2
                range={[mainHeight, 0]}
                offsetX={RANKWIDTH}
                max={maxScore}
              />
            ) : (
              <AxisRank
                range={[MARGIN_TOP, svgHeight]}
                offsetX={RANKWIDTH}
                scale={scaleRank}
              />
            )}
          </SvgBallots>
        )}
      </div>
      <div className="buttons">
        {step !== Step.INIT && (
          <Button
            style={{ flex: '0 0 auto' }}
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeftOutlined /> {BUTTONS[steps[step - 1]]}
          </Button>
        )}
        {step !== Step.TREEMAP && (
          <Button
            style={{
              flex: '0 0 auto',
              marginLeft: 'auto',
            }}
            onClick={() => setStep((s) => s + 1)}
          >
            {BUTTONS[steps[step + 1]]} <ArrowRightOutlined />
          </Button>
        )}
      </div>
      <style jsx>{`
        .svgContainer {
          position: relative;
          transition: height 2s;
          overflow: visible;
        }
        svg * {
          // transition: all 2000ms;
        }

        .buttons {
          display: flex;
          flex-wrap: wrap;
          margin-top: 10px;
        }
      `}</style>
      <style jsx>{`
        .svgContainer {
          height: ${svgHeight}px;
        }
      `}</style>
    </>
  )
}
