import type { AppProps } from 'next/app'
import { MDXProvider } from '@mdx-js/react'

// Import your custom components
import ImageGallery from '../components/ImageGallery'
import VideoEmbed from '../components/VideoEmbed'
import StoryFlowEmbed from '../components/StoryFlowEmbed'

// Map MDX tags to React components
const components = {
  ImageGallery,
  VideoEmbed,
  StoryFlowEmbed,
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  )
}

