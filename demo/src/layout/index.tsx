import { GithubOutlined } from '@ant-design/icons'
import { Layout } from 'antd'
import Link from 'next/link'
import React from 'react'

const { Header, Content } = Layout

export const MyLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Layout id="layout">
      {/*<div id="scroll" className="scroll">*/}
      <Header id="header">
        <h1>
          <Link href="/">
            <a>
              <span className="white">Ranked votes</span>
            </a>
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
      </Header>
      <Content id="content">{children}</Content>
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
    </Layout>
  )
}
