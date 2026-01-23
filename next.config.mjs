/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    
    domains: ['https://console.neon.tech', 'cdn.meusite.com'],
  
  },
}

export default nextConfig
