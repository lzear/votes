import React from 'react'
import { DemoSystems, useStore } from './store'
import { selectSetMethod } from './store/selectors'
import { Select, Typography } from 'antd'
import { votingTypeData } from './methods/descriptions'
import { methods } from './methods'

const options = Object.values(DemoSystems).filter(
  (v) => votingTypeData[v]?.name && methods[v]?.data,
)

console.log('%c options', 'background: #222; color: #bada55', options)

export const SelectMethod: React.FC = () => {
  const setMethod = useStore(selectSetMethod)
  return (
    <div className="container">
      <Typography.Title level={4}>Voting system</Typography.Title>
      <Select<string>
        size="large"
        style={{ minWidth: 250 }}
        placeholder="Select a voting system"
        onSelect={(v) => {
          console.log('%c v', 'background: #222; color: #bada55', v)

          // console.log('%c isVotingSystem(v)', 'background: #222; color: #bada55', isVotingSystem(v))

          setMethod(v)
        }}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        options={options.map((value) => {
          console.log('%c value', 'background: #222; color: #bada55', value)

          return {
            value,
            label: votingTypeData[value].name,
          }
        })}
      />
      <style jsx>{`
        .container {
          margin-top: 50px;
        }
      `}</style>
    </div>
  )
}
