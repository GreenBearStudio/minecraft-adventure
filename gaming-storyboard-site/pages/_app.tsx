// pages/_app.tsx
import type { AppProps } from 'next/app'
import { MDXProvider } from '@mdx-js/react'
import { UIProvider } from '../context/UIContext'
import { ToastProvider } from '../context/ToastContext'
import { StoryStateProvider } from "../context/StoryStateContext"
import { StoryNamespaceProvider } from "../context/StoryNamespaceContext"

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
import TileFlipPuzzle from '../components/TileFlipPuzzle'
import PuzzleChoiceBlock from '../components/PuzzleChoiceBlock'
import StoryReveal from '../components/StoryReveal'

const components = {
  ImageGallery,
  VideoEmbed,
  StoryFlowEmbed,
  ChoiceBlock,
  StoryboardMedia,
  EpisodeScene,
  AssetImage,
  AssetVideo,
  TileFlipPuzzle,
  PuzzleChoiceBlock,
  StoryReveal,
  StoryNamespaceProvider,
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoryStateProvider>
      <UIProvider>
        <ToastProvider>
          <MDXProvider components={components}>
            <Component {...pageProps} />
          </MDXProvider>
        </ToastProvider>
      </UIProvider>
    </StoryStateProvider>
  );
}



