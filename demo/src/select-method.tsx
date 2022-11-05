import React from 'react'
import { DemoSystems, useStore } from './store'
import { selectMethod, selectSetMethod } from './store/selectors'
import { Select, Text } from '@chakra-ui/react'
import { votingTypeData } from './methods/descriptions'
import { methods } from './methods'

const options = Object.values(DemoSystems).filter(
  (v) => votingTypeData[v]?.name && methods[v]?.data,
)

export const SelectMethod: React.FC = () => {
  const setMethod = useStore(selectSetMethod)
  const method = useStore(selectMethod)
  return (
    <div className="container">
      <Text level={4}>Voting system</Text>
      <Select<DemoSystems>
        size="large"
        style={{ minWidth: 250 }}
        placeholder="Select a voting system"
        onSelect={(v: DemoSystems) => setMethod(v)}
        value={method}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        options={options.map((value) => ({
          value,
          label: votingTypeData[value].name,
        }))}
      />
      <style jsx>{`
        .container {
          margin-top: 50px;
        }
      `}</style>
    </div>
  )
}
