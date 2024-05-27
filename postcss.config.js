// postcss.config.js
module.exports = {
  plugins: [
    'postcss-flexbugs-fixes',
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
        features: {
          'custom-properties': false,
        },
      },
    ],
    [
      '@fullhuman/postcss-purgecss',
      {
        content: [
          './src/**/*.js',
          './src/**/*.jsx',
          './src/**/*.ts',
          './src/**/*.tsx',
          './src/**/*.html',
        ],
        safelist: {
          standard: [/^mapbox/, /^leaflet/, /^fa-/, /^icon-/, /^cluster-/, /^small-/, /^medium-/, /^large-/, /^pulse-cluster/],
        },
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      },
    ],
  ],
};
