import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { MyLayout } from '../src/layout'

const Sandbox = dynamic(() => import('../src/sandbox'), { ssr: false })

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MyLayout>
        <Sandbox />
      </MyLayout>
    </>
  )
}

export default Home
