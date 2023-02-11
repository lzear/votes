import React, { useState } from 'react'
import {
  Button,
  Input,
  Tag,
  type TagProps,
  TagLabel,
  TagCloseButton,
  TagLeftIcon,
} from '@chakra-ui/react'
import { PlusSquareIcon } from '@chakra-ui/icons'
import { useStore } from './store'
import {
  selectAddCandidate,
  selectRemoveCandidate,
  selectUpdateCandidateCount,
  useCandidates,
} from './store/selectors'
import { PlusOutlined } from '@ant-design/icons'
import { Candidate } from './generate-ballots'
import { H4 } from './layout/headings'

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
      <H4>{candidates.length} candidates</H4>
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
        <Tag>
          <Input
            placeholder="Add candidate"
            size="small"
            style={{ height: 19, border: 0, background: 'transparent' }}
            value={adding}
            onChange={(v) => setAdding(v.target.value)}
            onSubmit={submit}
          />
          <Button
            disabled={disabled}
            // type="text"
            rightIcon={<PlusOutlined />}
            size="small"
            onClick={submit}
            style={{ height: 20 }}
          />
        </Tag>
        <span>or</span>
        <Tag
          tabIndex={0}
          sx={{
            cursor: 'pointer',
            float: 'right',
          }}
          // color={c.color}
          onClick={() => updateCandidateCount(candidates.length + 1)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') updateCandidateCount(candidates.length + 1)
          }}
        >
          <TagLeftIcon as={PlusSquareIcon}></TagLeftIcon>
          Add random emoji
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
    sx={{ margin: 0, background: candidate.color }}
    {...rest}
  >
    <TagLabel>{candidate.id}</TagLabel>
    {onClose && <TagCloseButton onClick={() => onClose(candidate)} />}
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
