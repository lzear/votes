import { GithubOutlined } from '@ant-design/icons'
import Link from 'next/link'
import React from 'react'

export const MyLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div id="layout">
      {/*<div id="scroll" className="scroll">*/}
      <div id="header">
        <h1>
          <Link href="/">
            <span className="white">Ranked votes</span>
          </Link>
        </h1>

        <a
          className="gh"
          tabIndex={0}
          href="https://github.com/lzear/votes"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubOutlined />
        </a>
        {/*<Me />*/}
      </div>
      <div id="content">{children}</div>
      {/*</div>*/}
      {/*<Foot />*/}
      <style jsx>{`
        h1 {
          margin-bottom: 0;
        }
        .scroll {
          // flex: 1 1 auto;
          // overflow: scroll;
        }
        :global(#header) {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        :global(#content) {
          padding: 20px;
          //   overflow-x: hidden;
          //   flex: 1 1 auto;
        }
        .white {
          color: white;
        }
        .gh {
          display: flex;
        }
      `}</style>
    </div>
  )
}
