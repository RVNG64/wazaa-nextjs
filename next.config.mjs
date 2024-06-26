import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'aquitaine.media.tourinsoft.eu' },
      { protocol: 'https', hostname: 'img01.ztat.net' },
      { protocol: 'https', hostname: 'api.mapbox.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  staticPageGenerationTimeout: 60,
  compress: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        permanent: true,
        destination: 'https://www.wazaa.app/:path*'
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'wazaa.app'
          }
        ],
        permanent: true,
        destination: 'https://www.wazaa.app/:path*'
      }
    ];
  },
  headers: async () => {
    return [
      {
        source: '/(.*)', // This will apply the headers to all pages and static files
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable' // One year cache duration for static files
          },
          {
            key: 'TDM-Policy',
            value: 'all-rights-reserved'
          }
        ]
      },
      {
        source: '/_next/static/(.*)', // Cache for Next.js generated static files
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable' // One year cache duration for Next.js static files
          }
        ]
      },
      {
        source: '/api/(.*)', // API caching
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60' // Cache API responses for 1 minute
          }
        ]
      },
      {
        source: '/static/(.*)', // Custom static files
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable' // One year cache duration for static files
          }
        ]
      },
      {
        source: '/fonts/(.*)', // Fonts
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable' // One year cache duration for fonts
          }
        ]
      }
    ]
  },

  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.css$/,
      exclude: /node_modules\/(?!react-datepicker|leaflet|react-leaflet-cluster|flatpickr)/, // Inclure les fichiers CSS de react-datepicker, leaflet, react-leaflet-cluster, et flatpickr
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
      ],
    });

    // Commenter ou supprimer la configuration pour Preact
    /*
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      };
    }
    */

    // Optimisation des imports lodash
    config.module.rules.push({
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel', '@babel/preset-react'],
          plugins: [
            ['babel-plugin-transform-imports', {
              'lodash': {
                'transform': 'lodash/${member}',
                'preventFullImport': true,
              }
            }]
          ]
        }
      }
    });

    // Correction de la configuration de SplitChunks
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 50000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    };

    return config;
  }
};

export default bundleAnalyzer(nextConfig);
