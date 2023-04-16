import React from 'react'
import { Typography } from 'antd'
import type { ScoreObject } from 'votes'

import { CandiTagList } from '../../candidates'
import type { Candidate } from '../../generate-ballots'

import { QuickScores } from './quick-scores'

export const ScoresSummary: React.FC<{
  scores: ScoreObject
  candidatesById: { [id: string]: Candidate }
}> = ({ scores, candidatesById }) => {
  const maxScore = Math.max(...Object.values(scores))
  const winners = Object.keys(scores).filter((c) => scores[c] === maxScore)
  return (
    <>
      <Typography.Title level={4}>Scores summary</Typography.Title>
      <Typography.Title level={5}>Winner</Typography.Title>
      <div className="block">
        <CandiTagList candidates={winners.map((c) => candidatesById[c])} />
      </div>
      <Typography.Title level={5} style={{ marginBottom: 0 }}>
        Scores
      </Typography.Title>
      <QuickScores candidatesById={candidatesById} scoreObject={scores} />
      <style jsx>{`
        .block {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  )
}
