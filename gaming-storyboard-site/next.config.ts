import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const withMDX = createMDX({
  extension: /\.mdx?$/
})

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default withMDX(nextConfig)

