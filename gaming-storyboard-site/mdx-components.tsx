import ImageGallery from './components/ImageGallery'
import VideoEmbed from './components/VideoEmbed'
import StoryFlowEmbed from './components/StoryFlowEmbed'
import ChoiceBlock from './components/ChoiceBlock'
import Choice from './components/Choice'
import StoryboardMedia from './components/StoryboardMedia'
import EpisodeScene from './components/EpisodeScene'
import AssetImage from "./components/AssetImage"
import AssetVideo from "./components/AssetVideo"
import TileFlipPuzzle from './components/TileFlipPuzzle'
import UnlockStage from "./components/UnlockStage";
import PuzzleChoiceBlock from './components/PuzzleChoiceBlock'
import PuzzleChoice from './components/PuzzleChoice'
import { StoryNamespaceProvider } from "./context/StoryNamespaceContext"
import SideStoryLink from './components/SideStoryLink'
import MazePuzzle from './components/MazePuzzle'

// Components safe for MDXProvider
export const mdxComponents = {
  ImageGallery,
  VideoEmbed,
  StoryFlowEmbed,

  // Choice system
  ChoiceBlock,
  Choice,

  // Puzzle system
  PuzzleChoiceBlock,
  PuzzleChoice,
  
  // Tile, Maze Puzzle
  TileFlipPuzzle,
  MazePuzzle,
  UnlockStage,

  StoryboardMedia,
  EpisodeScene,
  AssetImage,
  AssetVideo,
  StoryNamespaceProvider,
  SideStoryLink,
};

// Components that should NOT be used inside StoryReveal
export { default as StoryReveal } from './components/StoryReveal';

