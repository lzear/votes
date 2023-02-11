import React from 'react'
import { useStore } from './store'
import { selectMethod } from './store/selectors'
import { methods } from './methods'
import { H3 } from './layout/headings';

export const Results: React.FC = () => {
  const method = useStore(selectMethod)

  const MethodObj = methods[method]
  return (
    <div className="container">
      <H3>{MethodObj.data.name}</H3>
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
