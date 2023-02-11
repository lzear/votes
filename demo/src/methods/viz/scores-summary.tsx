import React from 'react'
import type { ScoreObject } from 'votes'
import { CandiTagList } from '../../candidates'
import { Candidate } from '../../generate-ballots'
import { QuickScores } from './quick-scores'
import { H4, H5 } from '../../layout/headings'

export const ScoresSummary: React.FC<{
  scores: ScoreObject
  candidatesById: { [id: string]: Candidate }
}> = ({ scores, candidatesById }) => {
  const maxScore = Math.max(...Object.values(scores))
  const winners = Object.keys(scores).filter((c) => scores[c] === maxScore)
  return (
    <>
      <H4>Scores summary</H4>
      <H5>Winner</H5>
      <div className="block">
        <CandiTagList candidates={winners.map((c) => candidatesById[c])} />
      </div>
      <H5 style={{ marginBottom: 0 }}>Scores</H5>
      <QuickScores candidatesById={candidatesById} scoreObject={scores} />
      <style jsx>{`
        .block {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  )
}
