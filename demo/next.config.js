/* eslint-disable @typescript-eslint/no-var-requires,unicorn/prefer-module */
// eslint-disable-next-line tsdoc/syntax
/** @type {import('next').NextConfig} */

const withPlugins = require('next-compose-plugins')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withLess = require('next-with-less')
const withPreconstruct = require('@preconstruct/next')
const { getThemeVariables } = require('antd/dist/theme')

// const dark = getThemeVariables({
//   dark: true, // Enable dark mode
//   compact: true, // Enable compact mode
// })

module.exports = withPlugins(
  [
    [withPreconstruct],
    [withBundleAnalyzer],
    [
      withLess,
      {
        lessLoaderOptions: {
          /* ... */
          lessOptions: {
            /* ... */
            modifyVars: {
              ...getThemeVariables({
                dark: true, // Enable dark mode
                compact: true, // Enable compact mode
              }),

              // Light
              // 'primary-color': '#237f61',
              // 'info-color': '#7ea695',
              // 'text-selection-bg': '#7ea695',
              // 'body-background': '#ccc',
              // 'text-color': '#333', // major text color

              // Dark
              'layout-header-background': '#4c527f',
              // 'primary-color': '#7fdcbd',
              'primary-color': '#67b59a',
              'info-color': '#589b84',
              'text-selection-bg': '#5a8171',
              'body-background': '#202020',
              'text-color': '#ddd', // major text color

              // Other
              // 'font-size-base': '16px',
              'link-focus-outline': 'auto',
              'border-radius-base': '2px',
              'font-family':
                "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji','Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
              'code-family':
                "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",

              /* ... */
            },
          },
        },
        lessOptions: {
          /* ... */
        },
      },
    ],
  ],
  {
    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    images: {
      formats: ['image/avif', 'image/webp'],
      domains: ['i.scdn.co'],
    },
    webpack5: true,

    swcMinify: true,
    experimental: {
      // concurrentFeatures: true,
      // serverComponents: true,
      // esmExternals: true,
      externalDir: true,
    },

    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  },
)
