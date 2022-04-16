import React from 'react'
import { trafficColor } from './traffic-color'
import { useStore } from './store'
import {
  selectMatrix,
  selectSetHighlightCandidates,
  useCandidatesById,
} from './store/selectors'
import { Typography } from 'antd'
import { CandiTag } from './candidates'
import shallow from 'zustand/shallow'

export const MatrixComp: React.FC = () => {
  const matrix = useStore(selectMatrix, shallow)
  const setHighlighted = useStore(selectSetHighlightCandidates, shallow)
  const candidatesById = useCandidatesById()
  const maxScore =
    matrix.array.reduce((acc, row) => Math.max(acc, ...row), 0) || 1
  return (
    <div className="container">
      <Typography.Title level={5}>Matrix of duels</Typography.Title>
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
                            matrix.array[k1][k2] / maxScore / 2 + 0.5,
                            // 30 + (30 * Math.abs(matrix.array[k1][k2])) / maxScore,
                            // 95 - (30 * Math.abs(matrix.array[k1][k2])) / maxScore,
                            45 +
                              (10 * Math.abs(matrix.array[k1][k2])) / maxScore,
                            55 -
                              (10 * Math.abs(matrix.array[k1][k2])) / maxScore,
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
