/* eslint-disable @typescript-eslint/no-var-requires,unicorn/prefer-module */
// eslint-disable-next-line tsdoc/syntax
/** @type {import('next').NextConfig} */

const withPlugins = require('next-compose-plugins')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withLess = require('next-with-less')
const { withSentryConfig } = require('@sentry/nextjs')

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// const dark = getThemeVariables({
//   dark: true, // Enable dark mode
//   compact: true, // Enable compact mode
// })

const withLessOptions = {
  lessLoaderOptions: {
    /* ... */
    lessOptions: {
      /* ... */
      modifyVars: {

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
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withPlugins(
  [
    [withBundleAnalyzer],
    [withLess, withLessOptions],
    [withSentryConfig, sentryWebpackPluginOptions],
  ],
  {
    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    webpack5: true,

    swcMinify: true,
    experimental: {
      // concurrentFeatures: true,
      // serverComponents: true,
      // esmExternals: true,
      externalDir: true,
    },
  },
)

module.exports = nextConfig
