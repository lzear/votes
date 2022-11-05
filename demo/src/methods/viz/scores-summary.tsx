import React from 'react'
import { Text } from '@chakra-ui/react'
import type { ScoreObject } from 'votes'
import { CandiTagList } from '../../candidates'
import { Candidate } from '../../generate-ballots'
import { QuickScores } from './quick-scores'

export const ScoresSummary: React.FC<{
  scores: ScoreObject
  candidatesById: { [id: string]: Candidate }
}> = ({ scores, candidatesById }) => {
  const maxScore = Math.max(...Object.values(scores))
  const winners = Object.keys(scores).filter((c) => scores[c] === maxScore)
  return (
    <>
      <Text level={4}>Scores summary</Text>
      <Text level={5}>Winner</Text>
      <div className="block">
        <CandiTagList candidates={winners.map((c) => candidatesById[c])} />
      </div>
      <Text level={5} style={{ marginBottom: 0 }}>
        Scores
      </Text>
      <QuickScores candidatesById={candidatesById} scoreObject={scores} />
      <style jsx>{`
        .block {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  )
}
