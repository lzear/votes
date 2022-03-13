import React from 'react'

export const SvgBallots: React.FC<{
  height: number
  containerWidth: number

  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  overflowSides?: number
  overflowTop?: number
  overflowBottom?: number
}> = ({
  children,
  containerWidth = 0,
  overflowTop = 0,
  overflowBottom = 0,
  overflowSides = 0,
  height,
}) => {
  const svgWidth = containerWidth + overflowSides * 2
  const svgHeight = height + overflowTop + overflowBottom
  return (
    <div className="svgContainer">
      <svg
        viewBox={`${-overflowSides} ${-overflowTop} ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>

      <style jsx>{`
        .svgContainer {
          transition: height 2s;
          overflow: hidden;
          overflow: visible;
        }
        svg {
          margin: ${-overflowTop}px ${-overflowSides}px ${-overflowBottom}px;
        }
      `}</style>
      <style jsx>{`
        .svgContainer {
          width: ${containerWidth}px;
          height: ${height}px;
          overflow: hidden;
        }
        svg {
          width: ${svgWidth};
          height: ${svgHeight};
        }
      `}</style>
    </div>
  )
}
