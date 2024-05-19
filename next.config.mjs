/** @type {import('next').NextConfig} */
// import Next from 'next';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'aquitaine.media.tourinsoft.eu' },
      { protocol: 'https', hostname: 'img01.ztat.net' }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  staticPageGenerationTimeout: 60,
  compress: true,
};

export default nextConfig;
