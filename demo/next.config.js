/* eslint-disable @typescript-eslint/no-var-requires,unicorn/prefer-module */
// eslint-disable-next-line tsdoc/syntax
/** @type {import('next').NextConfig} */

const withPlugins = require('next-compose-plugins')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withPreconstruct = require('@preconstruct/next')

// const dark = getThemeVariables({
//   dark: true, // Enable dark mode
//   compact: true, // Enable compact mode
// })

module.exports = withPlugins([[withPreconstruct], [withBundleAnalyzer]], {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['i.scdn.co'],
  },

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
})
