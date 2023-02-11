import React from 'react'
import { DemoSystems, useStore } from './store'
import { selectMethod, selectSetMethod } from './store/selectors'
import { Select } from '@chakra-ui/react'
import { votingTypeData } from './methods/descriptions'
import { methods } from './methods'
import { H4 } from './layout/headings'

const options = Object.values(DemoSystems).filter(
  (v) => votingTypeData[v]?.name && methods[v]?.data,
)

export const SelectMethod: React.FC = () => {
  const setMethod = useStore(selectSetMethod)
  const method = useStore(selectMethod)
  return (
    <div className="container">
      <H4>Voting system</H4>
      <Select
        size="large"
        style={{ minWidth: 250 }}
        placeholder="Select a voting system"
        onChange={(v) => setMethod(v.target.value as DemoSystems)}
        value={method}
        // getPopupContainer={(triggerNode) => triggerNode.parentElement}
      >
        {options.map((value) => (
          <option key={value} value={value}>
            {votingTypeData[value].name}
          </option>
        ))}
      </Select>
      <style jsx>{`
        .container {
          margin-top: 50px;
        }
      `}</style>
    </div>
  )
}
