import React from 'react'
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
      <h2 level={4}>Scores summary</h2>
      <h2 level={5}>Winner</h2>
      <div className="block">
        <CandiTagList candidates={winners.map((c) => candidatesById[c])} />
      </div>
      <h2 level={5} style={{ marginBottom: 0 }}>
        Scores
      </h2>
      <QuickScores candidatesById={candidatesById} scoreObject={scores} />
      <style jsx>{`
        .block {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  )
}
