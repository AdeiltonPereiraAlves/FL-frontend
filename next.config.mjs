/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/dashboard', destination: '/', permanent: false },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    
    domains: ['https://console.neon.tech', 'cdn.meusite.com'],
  
  },
}

export default nextConfig
