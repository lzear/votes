import React from 'react'
import { useStore } from './store'
import { selectMethod } from './store/selectors'
import { methods } from './methods'
import { Typography } from 'antd'

export const Results: React.FC = () => {
  const method = useStore(selectMethod)

  const MethodObj = methods[method]
  return (
    <div className="container">
      <Typography.Title level={3}>{MethodObj.data.name}</Typography.Title>
      <div className="block">{MethodObj.data.description}</div>
      <MethodObj.Visualisation />
      <style jsx>{`
        .container {
          margin-top: 40px;
        }
        .block {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}
