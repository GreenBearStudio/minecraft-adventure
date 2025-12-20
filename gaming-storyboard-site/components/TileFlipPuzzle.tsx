import { useState, useEffect } from 'react';
import { useStoryState } from "../context/StoryStateContext";
import { useStoryNamespace } from "../context/StoryNamespaceContext";

type Difficulty = 'easy' | 'medium' | 'hard';
type Theme = 'default' | 'snow' | 'forest' | 'desert';

interface TileFlipPuzzleProps {
  difficulty?: Difficulty;
  theme?: Theme;
  unlockStages?: {
    moves?: number;          // unlock after this many moves
    solved?: boolean;        // unlock when solved
    setFlag?: string | null; // trigger story flag
    content: React.ReactNode;
  }[];
}

export default function TileFlipPuzzle({ 
  difficulty = 'medium', 
  theme = 'default',
  unlockStages = []
}: TileFlipPuzzleProps) {

  // Puzzle size based on difficulty
  const sizeMap: Record<Difficulty, number> = {
    easy: 3,
    medium: 5,
    hard: 7,
  };

  const size = sizeMap[difficulty];

  const [grid, setGrid] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);

  // Track which flags have already fired (prevents infinite loops)
  const [firedFlags, setFiredFlags] = useState<Record<string, boolean>>({});

  const { setNamespacedFlag } = useStoryState();
  const namespace = useStoryNamespace();

  // Initialize puzzle
  useEffect(() => {
    const init = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.round(Math.random()))
    );
    setGrid(init);
    setMoves(0);
    setFiredFlags({}); // reset fired flags on new puzzle
  }, [size]);

  // Flip tile + neighbors
  const flip = (x: number, y: number) => {
    const dirs = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
    const newGrid = grid.map(row => [...row]);

    dirs.forEach(([dx,dy]) => {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        newGrid[ny][nx] ^= 1;
      }
    });

    setGrid(newGrid);
    setMoves(moves + 1);
  };

  // Check solved state
  const isSolved =
    grid.length > 0 &&
    grid.every(row => row.every(cell => cell === 0));

  // Theme colors
  const themeStyles: Record<Theme, { active: string; inactive: string }> = {
    default: { active: 'gold', inactive: 'black' },
    snow: { active: '#aeefff', inactive: '#003366' },
    forest: { active: '#4caf50', inactive: '#1b3d1b' },
    desert: { active: '#f4d35e', inactive: '#8c6d1f' },
  };

  const colors = themeStyles[theme];

  // 🔥 Trigger flags ONLY when a stage becomes visible
  useEffect(() => {
    unlockStages.forEach(stage => {
      const shouldShow =
        (stage.moves !== undefined && moves >= stage.moves) ||
        (stage.solved && isSolved);

      if (shouldShow && stage.setFlag && !firedFlags[stage.setFlag]) {
        const key = stage.setFlag; // TS now knows it's a string

        setNamespacedFlag(namespace, key, true);
        setFiredFlags(prev => ({ ...prev, [key]: true }));
      }
    });
  }, [moves, isSolved, unlockStages, firedFlags, setNamespacedFlag, namespace]);

  return (
    <div className="tile-flip-puzzle">
      {/* <h3>Tile Flip Puzzle ({difficulty}, {theme})</h3> */}
      
      {/* Theme legend */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: '2rem', 
      marginBottom: '0.5rem',
      fontSize: '0.9rem',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span 
          style={{ 
            width: '1rem', 
            height: '1rem', 
            background: colors.active, 
            border: '1px solid #333',
            display: 'inline-block' 
          }} 
        />
        Unlocked Cell
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span 
          style={{ 
            width: '1rem', 
            height: '1rem', 
            background: colors.inactive, 
            border: '1px solid #333',
            display: 'inline-block' 
          }} 
        />
        Inactive
      </div>
    </div>
      
      <p>Moves: {moves} {isSolved && "✅ Solved!"}</p>

      {/* Puzzle grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${size}, var(--tile-size))`,
          justifyContent: 'center',
          margin: '1rem 0'
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              onClick={() => flip(x, y)}
              style={{
                width: 'var(--tile-size)',
                height: 'var(--tile-size)',
                background: cell ? colors.active : colors.inactive,
                border: '1px solid #333',
                cursor: 'pointer'
              }}
            />
          ))
        )}
      </div>
      
      <p>A click on a cell, switches the states of nearby cells!</p>
      <p>Attempt to unlock all the cells!</p>

      {/* Unlock staged content */}
      {unlockStages.map((stage, i) => {
        const shouldShow =
          (stage.moves !== undefined && moves >= stage.moves) ||
          (stage.solved && isSolved);

        if (!shouldShow) return null;

        return (
          <div key={i} className="puzzle-solved-content">
            {stage.content}
          </div>
        );
      })}
    </div>
  );
}

