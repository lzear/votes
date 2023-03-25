import React, { useState } from 'react'
import { trafficColor } from './traffic-color'
import { useStore } from './store'
import {
  selectMatrix,
  selectSetHighlightCandidates,
  useCandidatesById,
} from './store/selectors'
import { Checkbox, Typography } from 'antd'
import { CandiTag } from './candidates'
import { shallow } from 'zustand/shallow'
import { utils } from 'votes'

export const MatrixComp: React.FC = () => {
  const [skew, setSkew] = useState(false)
  const _matrix = useStore(selectMatrix, shallow)
  const matrix = skew ? utils.makeAntisymetric(_matrix) : _matrix
  const setHighlighted = useStore(selectSetHighlightCandidates, shallow)
  const candidatesById = useCandidatesById()
  const maxScore =
    matrix.array.reduce((acc, row) => Math.max(acc, ...row), 0) || 1

  const minScore =
    matrix.array.reduce(
      (acc, row, rowIdx) =>
        Math.min(acc, ...row.filter((_v, colIdx) => colIdx !== rowIdx)),
      Infinity,
    ) || 0

  const score = (v: number) => (v - minScore) / (maxScore - minScore)

  return (
    <div className="container">
      <Typography.Title level={5}>Matrix of duels</Typography.Title>
      <Checkbox
        checked={skew}
        name={'Ske'}
        onChange={(v) => setSkew(v.target.checked)}
      >
        Normalize to skew matrix
      </Checkbox>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <td>vs.</td>
              {matrix.candidates.map((c) => (
                <th className="th" key={c}>
                  <CandiTag candidate={candidatesById[c]} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.candidates.map((c1, k1) => {
              return (
                <tr key={c1}>
                  <th>
                    <CandiTag candidate={candidatesById[c1]} />
                  </th>
                  {matrix.candidates.map((c2, k2) =>
                    c1 === c2 ? (
                      <td key={c2} />
                    ) : (
                      <td
                        tabIndex={0}
                        className="selectable"
                        key={c2}
                        style={{
                          // color: '#000',
                          background: trafficColor(
                            score(matrix.array[k1][k2]),
                            // 30 + (30 * Math.abs(matrix.array[k1][k2])) / maxScore,
                            // 95 - (30 * Math.abs(matrix.array[k1][k2])) / maxScore,
                            45 +
                              20 * Math.abs(score(matrix.array[k1][k2]) - 0.5),
                            55 -
                              20 * Math.abs(score(matrix.array[k1][k2]) - 0.5),
                          ),
                        }}
                        onFocus={() => setHighlighted([c1, c2])}
                        onBlur={() => setHighlighted()}
                      >
                        {matrix.array[k1][k2]}
                      </td>
                    ),
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <em>Click on cells to highlight the duels</em>
      <style jsx>{`
        .selectable:focus {
          outline: 1px solid #ccc;
        }
        .selectable {
          cursor: pointer;
        }
        table {
          border-collapse: collapse;
        }
        td,
        th {
          border: 1px solid #555;
          text-align: center;
          margin: 0;
          padding: 6px 13px;
        }
        th {
          font-weight: bold;
        }
        tr {
          border-top: 1px solid #cccccc;
        }
        .container {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
        }
        .container {
          margin-top: 40px;
        }
        .scroll {
          overflow-x: auto;
        }
      `}</style>
    </div>
  )
}
