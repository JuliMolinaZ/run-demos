/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Compatibilidad: links compartidos antiguos /demo/:id/public → /demos/:id/public
      { source: "/demo/:id/public", destination: "/demos/:id/public", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.utfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  outputFileTracingRoot: __dirname,
  // Habilitar standalone output para Docker
  output: 'standalone',
}

module.exports = nextConfig

