import {
  DeleteOutlined,
  EditOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import _ from 'lodash'
import React from 'react'
import { useStore } from './store'
import {
  selectBallots,
  selectChangeBallotWeight,
  selectHighlightedCandidates,
  selectSelectBallot,
  selectSelectedBallot,
  useCandidatesById,
} from './store/selectors'

export function numberToLetters(num: number) {
  let letters = ''
  while (num >= 0) {
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters
    num = Math.floor(num / 26) - 1
  }
  return letters
}

export const ListVotesGroup: React.FC = () => {
  const ballots = useStore(selectBallots)
  const changeBallotWeight = useStore(selectChangeBallotWeight)
  const selectBallot = useStore(selectSelectBallot)
  const selectedBallot = useStore(selectSelectedBallot)
  // const candidates = useStore(selectCandidates)
  const candidatesById = useCandidatesById()
  const highlightedCandidates = useStore(selectHighlightedCandidates)
  const groupedBallots = ballots
  const rowCount = Math.max(0, ...groupedBallots.map((b) => b.ranking.length))
  // const bgs = _.keyBy(candidates, 'id')

  const tdHeight = _.clamp(200 / Object.keys(candidatesById).length, 10, 40)

  return (
    <div className="container">
      <p>
        Preferences of voters are expressed in the following array. For better
        readability, votes with the same ranking are grouped and identified by a
        letter (which does not mean anything).
      </p>
      <table>
        <thead>
          <tr>
            <td />
            {groupedBallots.map((b) => (
              <th className="th" key={b.id}>
                {numberToLetters(b.idx)}
                <br />
                <Button
                  type="text"
                  icon={<MinusOutlined />}
                  size="small"
                  onClick={() => changeBallotWeight(-1)(b.id)}
                />
                {b.weight}
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => changeBallotWeight(1)(b.id)}
                />
                <br />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => changeBallotWeight(-b.weight)(b.id)}
                />
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() =>
                    selectBallot(selectedBallot?.id === b.id ? null : b.id)
                  }
                  style={{
                    outline:
                      selectedBallot?.id === b.id
                        ? 'solid #ccc 1px'
                        : undefined,
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {_.range(rowCount).map((rowIdx) => (
            <tr key={rowIdx}>
              <td>{rowIdx + 1}</td>
              {groupedBallots.map((b) => {
                return (
                  <td key={b.id} className="rank">
                    <div>
                      {b.ranking[rowIdx]?.map((c) => (
                        <div
                          key={c}
                          className="c"
                          style={{
                            background: candidatesById[c].color,
                            opacity:
                              highlightedCandidates &&
                              !highlightedCandidates?.[c]
                                ? 0.4
                                : 1,
                          }}
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .container {
          display: flex;
          overflow: auto;
          flex-direction: column;
          margin-top: 50px;
        }
        table {
          border-collapse: collapse;
          border-spacing: 0;
        }
        td,
        th {
          border: 1px solid #555;
          border-width: 1px 2px;
          text-align: center;
          margin: 0;
          // padding: 6px 13px;
        }
        td.rank {
          padding: 0;
          height: ${tdHeight}px;
        }
        td.rank > div {
          display: flex;
        }

        th {
          font-weight: bold;
        }
        tr {
          height: ${tdHeight}px;
          border-top: 1px solid #555;
        }
        table {
          height: 1px;
        }
        td > div {
          height: 100%;
        }
        .c {
          flex: 1 0 auto;
          display: flex;
          align-items: center; /* Vertical center alignment */
          justify-content: center; /* Horizontal center alignment */
        }
        .c + .c {
          border-left: solid 1px #555;
        }
      `}</style>
    </div>
  )
}
