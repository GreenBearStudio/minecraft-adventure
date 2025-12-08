// pages/_app.tsx
import type { AppProps } from 'next/app'
import { MDXProvider } from '@mdx-js/react'
import { ThemeProvider } from '../context/ThemeContext' 

// Import global stylesheet once here
import '../styles/globals.css'

// MDX components
import ImageGallery from '../components/ImageGallery'
import VideoEmbed from '../components/VideoEmbed'
import StoryFlowEmbed from '../components/StoryFlowEmbed'
import ChoiceBlock from '../components/ChoiceBlock'
import StoryboardMedia from '../components/StoryboardMedia'
import EpisodeScene from '../components/EpisodeScene'
import AssetImage from "../components/AssetImage"
import AssetVideo from "../components/AssetVideo"

const components = {
  ImageGallery,
  VideoEmbed,
  StoryFlowEmbed,
  ChoiceBlock,
  StoryboardMedia,
  EpisodeScene,
  AssetImage,
  AssetVideo,
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <MDXProvider components={components}>
        <Component {...pageProps} />
      </MDXProvider>
    </ThemeProvider>
  )
}

