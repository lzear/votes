import React, { useState } from 'react'
import type { ScoreObject } from 'votes'
import { Candidate } from '../../generate-ballots'
import { scaling } from '../../scale'
import { AxisCandidatesBot } from '../../axis'
import { useStore } from '../../store'
import { selectWidth, useCandidatesString } from '../../store/selectors'
import _ from 'lodash'
import { Checkbox } from 'antd'

const HEIGHT = 100

export const QuickScores: React.FC<{
  scoreObject: ScoreObject
  candidatesById: { [id: string]: Candidate }
}> = ({ scoreObject, candidatesById }) => {
  const [ranked, setRanked] = useState(false)
  const W = useStore(selectWidth) || 600
  const candidates = useCandidatesString()
  let filteredCandidates = candidates.filter((c) => c in scoreObject)
  if (ranked)
    filteredCandidates = filteredCandidates.sort(
      (a, b) => scoreObject[b] - scoreObject[a],
    )
  const barWidth = _.clamp(25, W / filteredCandidates.length, 200)
  const WI = barWidth * filteredCandidates.length
  const scaleCandidates = scaling({
    array: filteredCandidates,
    paddingInner: 0.1,
    domain: [0, barWidth * filteredCandidates.length],
  })
  const mainHeight = HEIGHT - 20

  const maxScore = Math.max(...Object.values(scoreObject))
  const minScore = Math.min(...Object.values(scoreObject), 0)

  return (
    <div className="container">
      <div className="checkbox-container">
        <Checkbox onChange={(e) => setRanked(e.target.checked)}>
          Order by score
        </Checkbox>
      </div>
      <svg height={HEIGHT} width={WI}>
        {filteredCandidates.map((candidate) => {
          const c = candidatesById[candidate]
          const { offset, width } = scaleCandidates[candidate]
          const height =
            mainHeight *
            ((scoreObject[candidate] - minScore) / (maxScore - minScore))
          return (
            <g key={candidate}>
              <rect
                // key={candidate}
                x={offset}
                width={width}
                y={mainHeight - height}
                height={height}
                fill={c.color}
              />
              <text
                x={offset + width / 2}
                alignmentBaseline="middle"
                textAnchor="middle"
                pointerEvents="none"
                y={Math.min(mainHeight - height + 15, mainHeight - 8)}
                fill="#fff"
              >
                {/*{numeral(scoreObject[candidate] + 1100.124).format('0.[00]a')}*/}
                {scoreObject[candidate]}
              </text>
            </g>
          )
        })}
        <AxisCandidatesBot
          range={[0, WI]}
          offsetY={mainHeight}
          candidates={filteredCandidates}
          scale={scaleCandidates}
        />
      </svg>
      <style jsx>{`
        .container {
          overflow-x: auto;
          padding-bottom: 10px;
        }
        .checkbox-container {
          text-align: right;
        }
      `}</style>
    </div>
  )
}
