import React from 'react'
import _ from 'lodash'
import { B_GUTTER, B_HEIGHT } from './constants'

interface Props {
  hovered: number | null
  count: number
  bHeight: number
  bGutter: number
}

const BB: React.FC<Props> = ({ count, hovered }) => (
  <>
    {_.range(count * 2 + 1).map((bucket) => (
      <div
        className="bucket"
        key={bucket}
        style={{
          top: (B_HEIGHT + B_GUTTER) * bucket,
          backgroundColor:
            hovered === bucket
              ? 'rgba(100, 100, 100, 0.3)'
              : 'rgba(100, 100, 100, 0.1)',
        }}
      >
        {bucket % 2 ? (bucket + 1) / 2 : null}
      </div>
    ))}
    <style jsx>
      {`
        .bucket {
          user-select: none;
          position: absolute;
          height: ${B_HEIGHT}px;
          width: 100%;
          border-radius: 5px;
          transition: background 0.3s;
          line-height: 40px;
          padding: 0 10px;
          display: flex;
          align-items: center;
        }
      `}
    </style>
  </>
)

export default BB
