import type { AppProps } from 'next/app'
import PlausibleProvider from 'next-plausible'
import { ChakraProvider } from '@chakra-ui/react'

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'

config.autoAddCss = false

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PlausibleProvider domain="rank-votes.vercel.app">
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </PlausibleProvider>
  )
}

export default MyApp
