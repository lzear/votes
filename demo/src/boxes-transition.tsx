import { a, TransitionFn, useTransition } from '@react-spring/web'
import { ReactDOMAttributes } from '@use-gesture/react'
import _ from 'lodash'
import { BoxMeta, BoxPosition, WithColor } from './ballots-ui'

type TrState = {
  x: number
  y: number
  width: number
  height: number
  opacity: number
  fill: string
  filter?: string
}

export const useBoxesTransition = (
  boxes: (BoxMeta & BoxPosition & WithColor & { opacity?: number })[],
): TransitionFn<
  BoxMeta & BoxPosition & WithColor & { opacity?: number },
  TrState
> => {
  return useTransition<
    BoxMeta & BoxPosition & WithColor & { opacity?: number },
    TrState
  >(boxes, {
    expires: false,
    from: (item) => ({
      fill: item.fill,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      opacity: item.opacity ?? 1,
    }),
    initial: (item) => ({
      fill: item.fill,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      opacity: item.opacity ?? 1,
    }),
    leave: { opacity: 0 },
    update: (item) => ({
      fill: item.fill,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      opacity: item.opacity ?? 1,
    }),
    // delay: 200,
    // keys: (item) => item.key,
    // Using an array created by lodash.map
    keys: _.map(boxes, 'key'),
  })
}

export const renderBoxes = (
  transitions: TransitionFn<
    BoxMeta &
      BoxPosition &
      WithColor & {
        opacity?: number
        filter?: string
        display?: string
        contrast?: boolean
      },
    TrState
  >,
  bind: (...args: unknown[]) => ReactDOMAttributes = () => ({}),
) => {
  return transitions((d, box) => {
    const { x, y, height, width, fill, opacity, filter } = d
    const { ballotId, candidate, id, display } = box
    return (
      <a.g
        // {...gg()}
        key={id}
        id={id}
        x={x}
        y={y}
        // transform={`translate(${offset[0]}, ${offset[1]})`}
        style={{
          opacity: opacity, //.to({ range: [1, 0], output: [1, 0] }),
          x,
          filter,
          y,
        }}
        {...bind(x)}
      >
        <a.rect
          style={{
            fill,
            height,
            width,
            // filter: contrast ? 'brightness(1.6)' : undefined,
          }}
        />
        <a.text
          key={ballotId + candidate}
          style={{
            x: width.to((v) => v / 2),
            y: height.to((v) => v / 2),
          }}
          alignmentBaseline="middle"
          textAnchor="middle"
          pointerEvents="none"
          fill="#fff"
        >
          {display || candidate}
        </a.text>
      </a.g>
    )
  })
}
