import { config } from '@fortawesome/fontawesome-svg-core'
import type { AppProps } from 'next/app'
import PlausibleProvider from 'next-plausible'

import '@fortawesome/fontawesome-svg-core/styles.css'

config.autoAddCss = false

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PlausibleProvider domain="rank-votes.vercel.app">
      <Component {...pageProps} />
    </PlausibleProvider>
  )
}

export default MyApp
