import React, { useState } from 'react'
import { Button, Input, Tag, type TagProps, Typography } from 'antd'
import { Plus } from 'lucide-react'

import {
  selectAddCandidate,
  selectRemoveCandidate,
  selectUpdateCandidateCount,
  useCandidates,
} from './store/selectors'
import type { Candidate } from './generate-ballots'
import { useStore } from './store'

export const Candidates: React.FC = () => {
  const candidates = useCandidates()
  const removeCandidate = useStore(selectRemoveCandidate)

  const updateCandidateCount = useStore(selectUpdateCandidateCount)
  const addCandidate = useStore(selectAddCandidate)
  const [adding, setAdding] = useState('')

  const disabled =
    adding.length === 0 || candidates.some((c) => c.id === adding)
  const submit = () => {
    if (!disabled) {
      addCandidate(adding)
      setAdding('')
    }
  }
  return (
    <div className="container">
      <Typography.Title level={4}>
        {candidates.length} candidates
      </Typography.Title>
      <div className="tags">
        {candidates.map((c) => (
          <CandiTag
            key={c.id}
            candidate={c}
            onClose={() => removeCandidate(c.id)}
            style={{ margin: 0 }}
          >
            {c.id}
          </CandiTag>
        ))}
      </div>

      <div className="flex-horiz">
        <Tag
          style={{
            width: 150,
            paddingRight: 23,
            paddingLeft: 0,
            margin: 0,
          }}
        >
          <Input
            placeholder="Add candidate"
            size="small"
            style={{ height: 19, border: 0, background: 'transparent' }}
            value={adding}
            onChange={(v) => setAdding(v.target.value)}
            onPressEnter={submit}
          />
          <Button
            disabled={disabled}
            // type="text"
            type="primary"
            icon={<Plus />}
            size="small"
            onClick={submit}
            style={{ height: 20 }}
          />
        </Tag>
        <span>or</span>
        <Tag
          tabIndex={0}
          style={{
            cursor: 'pointer',
            float: 'right',
          }}
          // color={c.color}
          onClick={() => updateCandidateCount(candidates.length + 1)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') updateCandidateCount(candidates.length + 1)
          }}
        >
          <Plus /> Add random emoji
        </Tag>
      </div>
      <style jsx>{`
        .container {
          flex: 1 1 0px;
          padding-right: 20px;
        }
        .tags {
          display: flex;
          flex-direction: row;

          flex-wrap: wrap;

          gap: 5px;
        }
        .flex-horiz {
          margin-top: 10px;
          display: flex;
          flex-direction: row;

          justify-content: center;
          align-items: center;
          flex-wrap: wrap;

          gap: 10px;
        }

        .flex-horiz > * {
          // margin-top: 10px;
        }
      `}</style>
    </div>
  )
}

export const CandiTag: React.FC<
  {
    candidate: Candidate
    onClose?: (candidate: Candidate) => void
  } & TagProps
> = ({ candidate, onClose, ...rest }) => (
  <Tag
    closable={!!onClose}
    onClose={onClose ? () => onClose(candidate) : undefined}
    color={candidate.color}
    style={{ margin: 0 }}
    {...rest}
  >
    {candidate.id}
  </Tag>
)

export const CandiTagList: React.FC<
  {
    candidates: Candidate[]
    onClose?: (candidate: Candidate) => void
  } & TagProps
> = ({ candidates, onClose, style, ...rest }) => (
  <div style={{ margin: -2, display: 'inline' }}>
    {candidates.map((candidate) => (
      <CandiTag
        key={candidate.id}
        candidate={candidate}
        onClose={onClose}
        style={{ margin: 2, ...style }}
        {...rest}
      />
    ))}
  </div>
)
