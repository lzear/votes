import React from 'react'

import { selectMethod } from './store/selectors'
import { methods } from './methods'
import { useStore } from './store'

export const Results: React.FC = () => {
  const method = useStore(selectMethod)

  const MethodObj = methods[method]
  return (
    <div className="container">
      <h2 level={3}>{MethodObj.data.name}</h2>
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
