import type { AppProps } from 'next/app'
import { MDXProvider } from '@mdx-js/react'

import ImageGallery from '../components/ImageGallery'
import VideoEmbed from '../components/VideoEmbed'
import StoryFlowEmbed from '../components/StoryFlowEmbed'
import ChoiceBlock from '../components/ChoiceBlock'

const components = {
  ImageGallery,
  VideoEmbed,
  StoryFlowEmbed,
  ChoiceBlock,
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  )
}

