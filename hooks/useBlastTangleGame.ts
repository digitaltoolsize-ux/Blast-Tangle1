
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHint } from '@/ai/flows/get-hint';
import { BLOCK_SHAPES, BLOCK_TYPES, BLOCK_COLORS, type Block, type BlockShape } from '@/lib/blast-tangle/blocks';
import { useSound } from './useSound';

const GRID_SIZE = 10;
const NUM_AVAILABLE_BLOCKS = 3;

type GameState = 'home' | 'playing' | 'game-over' | 'paused';

export interface Hint {
  shape: BlockShape;
  position: { x: number; y: number };
  reasoning: string;
}

export interface ScoreRecord {
  id: string;
  score: number;
  date: string;
}


const createEmptyGrid = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

const rotateBlockShape = (shape: BlockShape): BlockShape => {
  const rows = shape.length;
  const cols = shape[0].length;
  const newShape: BlockShape = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newShape[c][rows - 1 - r] = shape[r][c];
    }
  }
  return newShape;
};

export const useBlastTangleGame = () => {
  const [gameState, setGameState] = useState<GameState>('home');
  const [grid, setGrid] = useState<number[][]>(createEmptyGrid());
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<ScoreRecord[]>([]);
  const [hasSave, setHasSave] = useState(false);
  const [hint, setHint] = useState<Hint | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [clearingCells, setClearingCells] = useState<[number, number][]>([]);
  const { playSound, isSoundEnabled, toggleSound } = useSound();
  const [previousGameState, setPreviousGameState] = useState<GameState>('home');


  useEffect(() => {
    try {
        const savedBestScore = localStorage.getItem('blast-tangle-best-score');
        if (savedBestScore) setBestScore(parseInt(savedBestScore, 10));

        const savedHistory = localStorage.getItem('blast-tangle-score-history');
        if (savedHistory) setScoreHistory(JSON.parse(savedHistory));

        const savedGame = localStorage.getItem('blast-tangle-game');
        setHasSave(!!savedGame);
    } catch (e) {
        console.error("Error loading data from localStorage", e);
    }
  }, []);

  const saveScore = useCallback((finalScore: number) => {
    if (finalScore <= 0) return;

    const newRecord: ScoreRecord = {
      id: crypto.randomUUID(),
      score: finalScore,
      date: new Date().toISOString(),
    };

    const updatedHistory = [newRecord, ...scoreHistory].slice(0, 50); // Keep last 50 scores
    setScoreHistory(updatedHistory);
    localStorage.setItem('blast-tangle-score-history', JSON.stringify(updatedHistory));

    if (finalScore > bestScore) {
      setBestScore(finalScore);
      localStorage.setItem('blast-tangle-best-score', String(finalScore));
    }
  }, [scoreHistory, bestScore]);


  const saveGame = useCallback(() => {
    if (gameState !== 'playing') return;
    try {
      const stateToSave = { grid, availableBlocks, score };
      localStorage.setItem('blast-tangle-game', JSON.stringify(stateToSave));
      setHasSave(true);
    } catch (e) {
      console.error("Error saving game to localStorage", e);
    }
  }, [grid, availableBlocks, score, gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      saveGame();
    }
  }, [grid, availableBlocks, score, gameState, saveGame]);

  const generateRandomBlock = useCallback((): Block => {
    const type = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
    const shape = BLOCK_SHAPES[type as keyof typeof BLOCK_SHAPES];
    const colorIndex = Math.floor(Math.random() * BLOCK_COLORS.length);
    const color = BLOCK_COLORS[colorIndex];
    return { id: crypto.randomUUID(), shape, type, color, rotation: 0 };
  },[]);

  const generateNewBlocks = useCallback(() => {
    const newBlocks = Array.from({ length: NUM_AVAILABLE_BLOCKS }, generateRandomBlock);
    setAvailableBlocks(newBlocks);
    return newBlocks;
  }, [generateRandomBlock]);


  const handleRotateBlock = (blockId: string) => {
    playSound('click-sound');
    setAvailableBlocks(prevBlocks =>
      prevBlocks.map(b =>
        b.id === blockId ? { ...b, shape: rotateBlockShape(b.shape), rotation: (b.rotation + 1) % 4 } : b
      )
    );
  };
  
  const canPlace = useCallback((currentGrid: number[][], blockShape: BlockShape, row: number, col: number) => {
    if (row < 0 || col < 0 || row + blockShape.length > GRID_SIZE || col + blockShape[0].length > GRID_SIZE) {
        return false;
    }

    for (let r = 0; r < blockShape.length; r++) {
      for (let c = 0; c < blockShape[0].length; c++) {
        if (blockShape[r][c] === 1) {
          if (
            currentGrid[row + r][col + c] !== 0
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const checkGameOver = useCallback((currentGrid: number[][], currentBlocks: Block[]) => {
    if (currentBlocks.length === 0) return false;
    for (const block of currentBlocks) {
      let tempShape = block.shape;
      for(let i=0; i<4; i++) {
          for (let r = 0; r <= GRID_SIZE - tempShape.length; r++) {
            for (let c = 0; c <= GRID_SIZE - tempShape[0].length; c++) {
              if (canPlace(currentGrid, tempShape, r, c)) {
                return false;
              }
            }
          }
          tempShape = rotateBlockShape(tempShape);
      }
    }
    return true;
  }, [canPlace]);

  const clearLines = useCallback((currentGrid: number[][], onClearComplete: (finalGrid: number[][], linesClearedCount: number) => void) => {
    let linesClearedCount = 0;
    const newGrid = currentGrid.map(row => [...row]);
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];
    let clearedCells: [number, number][] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every(cell => cell > 0)) {
        rowsToClear.push(r);
      }
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid.every(row => row[c] > 0)) {
        colsToClear.push(c);
      }
    }

    linesClearedCount = rowsToClear.length + colsToClear.length;

    if (linesClearedCount > 0) {
      playSound('clear-sound');
      rowsToClear.forEach(r => {
        for(let c = 0; c < GRID_SIZE; c++) {
          clearedCells.push([r, c]);
        }
      });
      colsToClear.forEach(c => {
        for(let r = 0; r < GRID_SIZE; r++) {
            if(!rowsToClear.includes(r)) clearedCells.push([r,c]);
        }
      });
      
      setClearingCells(clearedCells);
      
      setTimeout(() => {
        const gridAfterClear = createEmptyGrid();
        
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
              if (!rowsToClear.includes(r) && !colsToClear.includes(c)) {
                gridAfterClear[r][c] = newGrid[r][c];
              }
          }
        }
        
        setClearingCells([]);
        onClearComplete(gridAfterClear, linesClearedCount);
      }, 500); 
    } else {
       onClearComplete(newGrid, 0);
    }
  }, [playSound]);

  const handleBlockDrop = useCallback((block: Block, row: number, col: number) => {
    if (!block) return;
    
    if (!canPlace(grid, block.shape, row, col)) return;
    
    playSound('place-sound');
    setHint(null);
    let blocksPlaced = 0;
    const newGrid = grid.map(r => [...r]);
    const colorIndex = BLOCK_COLORS.indexOf(block.color);
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[0].length; c++) {
        if (block.shape[r][c] === 1) {
          newGrid[row + r][col + c] = colorIndex + 1;
          blocksPlaced++;
        }
      }
    }
    
    const remainingBlocks = availableBlocks.filter(b => b.id !== block.id);
    
    clearLines(newGrid, (finalGrid, linesClearedCount) => {
        const scoreToAdd = blocksPlaced + (linesClearedCount * GRID_SIZE * linesClearedCount);
        const newScore = score + scoreToAdd;
        setScore(newScore);

        setGrid(finalGrid);
        
        const updatedBlocks = [...remainingBlocks, generateRandomBlock()];
        setAvailableBlocks(updatedBlocks);
        
        if (checkGameOver(finalGrid, updatedBlocks)) {
          playSound('game-over-sound');
          saveScore(newScore);
          setGameState('game-over');
          localStorage.removeItem('blast-tangle-game');
          setHasSave(false);
        }
    });
   
  }, [availableBlocks, canPlace, grid, clearLines, score, generateRandomBlock, checkGameOver, playSound, saveScore]);

  const startGame = useCallback(() => {
    playSound('click-sound');
    setGrid(createEmptyGrid());
    generateNewBlocks();
    setScore(0);
    setGameState('playing');
    setHint(null);
  }, [generateNewBlocks, playSound]);

  const continueGame = useCallback(() => {
    playSound('click-sound');
    if (gameState === 'paused') {
      setGameState(previousGameState);
      return;
    }

    const savedGame = localStorage.getItem('blast-tangle-game');
    if (savedGame) {
      try {
        const { grid, availableBlocks, score } = JSON.parse(savedGame);
        setGrid(grid);
        setAvailableBlocks(availableBlocks.map((b: Block) => {
          const originalShape = BLOCK_SHAPES[b.type as keyof typeof BLOCK_SHAPES];
          let shape = originalShape;
          for(let i=0; i < b.rotation; i++) {
              shape = rotateBlockShape(shape);
          }
          return {...b, shape};
        }));
        setScore(score);
        setGameState('playing');
        setHint(null);
      } catch (e) {
        console.error("Failed to parse saved game state:", e);
        startGame();
      }
    } else {
      startGame();
    }
  }, [startGame, playSound, gameState, previousGameState]);

  const restartGame = () => {
    playSound('click-sound');
    saveScore(score);
    localStorage.removeItem('blast-tangle-game');
    setHasSave(false);
    startGame();
  };
  
  const clearSave = () => {
    playSound('click-sound');
    localStorage.removeItem('blast-tangle-game');
    setHasSave(false);
  };


  const requestHint = useCallback(async () => {
    playSound('click-sound');
    setIsHintLoading(true);
    setHint(null);
    try {
      const result = await getHint({ 
        grid: grid.map(r => r.map(c => c > 0 ? 1 : 0)), 
        blocks: availableBlocks.map(b => b.shape) 
      });
      if (result.hint) {
        const { blockIndex, x, y, rotation } = result.hint;
        const hintedBlock = availableBlocks[blockIndex];
        if (!hintedBlock) return;
        
        let hintedBlockShape = BLOCK_SHAPES[hintedBlock.type as keyof typeof BLOCK_SHAPES];
        for (let i = 0; i < rotation; i++) {
          hintedBlockShape = rotateBlockShape(hintedBlockShape);
        }
        setHint({
          shape: hintedBlockShape,
          position: { x, y },
          reasoning: result.reasoning
        });
      }
    } catch (error) {
      console.error("Error getting hint:", error);
    } finally {
      setIsHintLoading(false);
    }
  }, [grid, availableBlocks, playSound]);

  const pauseGame = () => {
    if (gameState === 'playing') {
      setPreviousGameState(gameState);
      setGameState('paused');
    }
  };

  return {
    gameState,
    grid,
    availableBlocks,
    score,
    bestScore,
    scoreHistory,
    hasSave,
    hint,
    isHintLoading,
    clearingCells,
    isSoundEnabled,
    startGame,
    continueGame,
    restartGame,
    handleBlockDrop,
    handleRotateBlock,
    requestHint,
    setGameState,
    toggleSound,
    pauseGame,
    clearSave,
  };
};
