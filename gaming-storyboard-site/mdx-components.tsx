import ImageGallery from './components/ImageGallery'
import VideoEmbed from './components/VideoEmbed'
import StoryFlowEmbed from './components/StoryFlowEmbed'
import ChoiceBlock from './components/ChoiceBlock'
import StoryboardMedia from './components/StoryboardMedia'
import EpisodeScene from './components/EpisodeScene'
import AssetImage from "./components/AssetImage"
import AssetVideo from "./components/AssetVideo"
import TileFlipPuzzle from './components/TileFlipPuzzle'
import PuzzleChoiceBlock from './components/PuzzleChoiceBlock'
import { StoryNamespaceProvider } from "./context/StoryNamespaceContext"
import SideStoryLink from './components/SideStoryLink'

// Components safe for MDXProvider
export const mdxComponents = {
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
  StoryNamespaceProvider,
  SideStoryLink,
};

// Components that should NOT be used inside StoryReveal
export { default as StoryReveal } from './components/StoryReveal';

